import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, convertInchesToTwip, Packer, Table, TableRow, TableCell, WidthType, VerticalAlign } from 'docx'
import { saveAs } from 'file-saver'

/**
 * 导出红头文件为Word文档
 * @param {Object} content - 文档内容对象
 * @param {Object} options - 导出选项
 * @param {string} options.headerType - 红头类型: 'admin' | 'party' | 'letter'
 * @param {boolean} options.showSeal - 是否显示公章
 * @param {string} options.fileName - 文件名（不含扩展名）
 */
export async function exportToWord(content, options = {}) {
    const {
        headerType = 'admin',
        showSeal = false,
        fileName = '公文'
    } = options

    // 获取发文单位名称
    const senderNames = {
        admin: '广西警察学院',
        party: '中共广西警察学院委员会',
        letter: '广西警察学院'
    }
    const senderName = senderNames[headerType] || '广西警察学院'

    // 创建文档
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1.46),    // 37mm ≈ 1.46 inch
                        right: convertInchesToTwip(1.10),  // 28mm ≈ 1.10 inch
                        bottom: convertInchesToTwip(1.38), // 35mm ≈ 1.38 inch
                        left: convertInchesToTwip(1.10),   // 28mm ≈ 1.10 inch
                    },
                },
            },
            children: [
                // 红头标题区 - 上红线
                createRedLine(),

                // 发文单位（红头）
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        before: 200,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: senderName,
                            bold: true,
                            size: 44, // 22pt = 44 half-points
                            color: 'C00000', // 红色
                            font: {
                                name: 'SimHei', // 黑体
                                eastAsia: 'SimHei'
                            }
                        }),
                    ],
                }),

                // 红头标题区 - 下红线
                createRedLine(),

                // 文号
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        before: 400,
                        after: 300,
                    },
                    children: [
                        new TextRun({
                            text: content?.doc_number || '',
                            size: 32, // 16pt = 32 half-points
                            font: {
                                name: 'FangSong', // 仿宋
                                eastAsia: 'FangSong'
                            }
                        }),
                    ],
                }),

                // 主标题
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        before: 400,
                        after: 600,
                    },
                    children: [
                        new TextRun({
                            text: content?.title || '',
                            bold: true,
                            size: 44, // 22pt = 44 half-points
                            font: {
                                name: 'SimHei', // 黑体
                                eastAsia: 'SimHei'
                            }
                        }),
                    ],
                }),

                // 正文段落
                ...(content?.paragraphs || []).map((paragraph, index) =>
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, // 两端对齐
                        spacing: {
                            line: 480, // 固定行距 2倍
                            before: 0,
                            after: 0,
                        },
                        indent: {
                            firstLine: convertInchesToTwip(0.28), // 2字符缩进，约7mm
                        },
                        children: [
                            new TextRun({
                                text: paragraph,
                                size: 32, // 16pt = 32 half-points
                                font: {
                                    name: 'FangSong', // 仿宋
                                    eastAsia: 'FangSong'
                                }
                            }),
                        ],
                    })
                ),
            ],
        }],
    })

    // 生成并下载文档
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${fileName}.docx`)
}

/**
 * 创建红线段落（使用表格实现居中的短红线）
 */
function createRedLine() {
    return new Table({
        alignment: AlignmentType.CENTER,
        width: {
            size: 30, // 30% 宽度
            type: WidthType.PERCENTAGE,
        },
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: 'C00000' }, // 红色底边
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [
            new TableRow({
                height: { value: 100, rule: 'exact' },
                children: [
                    new TableCell({
                        borders: {
                            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            bottom: { style: BorderStyle.SINGLE, size: 12, color: 'C00000' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        },
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: '' })],
                            }),
                        ],
                        verticalAlign: VerticalAlign.CENTER,
                    }),
                ],
            }),
        ],
    })
}

/**
 * 导出模板预览为Word
 * @param {Object} template - 模板对象
 */
export async function exportTemplateToWord(template) {
    const content = {
        doc_number: template.doc_number || '',
        title: template.title || template.name,
        paragraphs: template.content ? template.content.split('\n').filter(p => p.trim()) : [],
    }

    await exportToWord(content, {
        headerType: template.category === '党务类' ? 'party' : 'admin',
        fileName: template.name || '模板文档',
    })
}
