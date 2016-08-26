import 'Ext/dataview/DataView';

/**
 * Defines a view to show formula examples
 */
Ext.define('CJ.view.tool.formula.ExampleList', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.dataview.DataView',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tool-formula-example-list',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-formula-example-list',
        /**
         * @cfg {Object} scrollable
         */
        scrollable: null,
        /**
         * @cfg {Array|String} itemTpl
         */
        itemTpl: [
            '<tpl if=\'xindex == 0\'>',
            '<h5>{label}</h5>',
            '</tpl>',
            '<span class=\'value\'>{value}</span>'
        ],
        /**
         * @cfg {Object} store
         */
        store: {}
    },
    constructor() {
        this.callParent(args);
        this.on('refresh', this.onListRefresh, this);    // by some reasons dataview doesn't
                                                         // fire event 'painted', so need to refresh manually
        // by some reasons dataview doesn't
        // fire event 'painted', so need to refresh manually
        this.refresh();
    },
    applyStore(value) {
        if (!value)
            return value;
        value = {
            data: (() => {
                const data = [
                    {
                        type: 'Functions',
                        label: 'tool-formula-example-function',
                        items: [
                            [
                                'a logc( b(x-h) ) +k',
                                'Exemple1_Function.png'
                            ],
                            [
                                '1/2*sin( pi/4 * (x +2pi) ) -1',
                                'Exemple2_Function.png'
                            ],
                            [
                                'abs(x) >= 0',
                                'Exemple3_Function.png'
                            ],
                            [
                                'ent( 14/3 ) = 4',
                                'Exemple4_Function.png'
                            ],
                            [
                                'arcsin( rac(3)/2 ) = sin-1( rac(3)/2)',
                                'Exemple5_Function.png'
                            ]
                        ]
                    },
                    {
                        type: 'Arithmetic',
                        label: 'tool-formula-example-arithmetic',
                        items: [
                            [
                                '1/2 div 3/4 = 0',
                                'Exemple1_Arithmetic.png'
                            ],
                            [
                                'seg(6) approx 0,667',
                                'Exemple2_Arithmetic.png'
                            ],
                            [
                                '1/2 + 20% = 0,7',
                                'Exemple3_Arithmetic.png'
                            ],
                            [
                                '( 5 + -2 (1 - 0,3)^2 ) / (-1 + 4) fois 2/3 -3',
                                'Exemple4_Arithmetic.png'
                            ],
                            [
                                '120 = 2^3 * 3 * 5',
                                'Exemple5_Arithmetic.png'
                            ],
                            [
                                '2^(3 - 3) != 0',
                                'Exemple6_Arithmetic.png'
                            ],
                            [
                                'rac3(27) < 4',
                                'Exemple7_Arithmetic.png'
                            ]
                        ]
                    },
                    {
                        type: 'Algebra',
                        label: 'tool-formula-example-algebra',
                        items: [
                            [
                                '3xy2z6 - 4x2',
                                'Exemple1_Algebra.png'
                            ],
                            [
                                'A = 2pih + 2pir2',
                                'Exemple2_Algebra.png'
                            ],
                            [
                                '( -b pm rac(b^2-4ac) ) / 2a',
                                'Exemple3_Algebra.png'
                            ],
                            [
                                '3(x-1)(x+5) div (2x2 + 6x + 10)/(x+5)',
                                'Exemple4_Algebra.png'
                            ],
                            [
                                'd = rac( (x_2 - x_1)^2 + (y_2 - y_1)^2 )',
                                'Exemple5_Algebra.png'
                            ],
                            [
                                'Delta t = t_2 - t_1',
                                'Exemple6_Algebra.png'
                            ],
                            [
                                'sec2(theta) = 1 + tan2(theta)',
                                'Exemple7_Algebra.png'
                            ]
                        ]
                    },
                    {
                        type: 'Set',
                        label: 'tool-formula-example-set',
                        items: [
                            [
                                'Omega = {1,2,3,4,5,6}',
                                'Exemple1_Set.png'
                            ],
                            [
                                'x app ] -infini , -3] union [3,9[',
                                'Exemple2_Set.png'
                            ],
                            [
                                '{1,2,3,4} inter {3,4,5,6} = {3,4}',
                                'Exemple3_Set.png'
                            ],
                            [
                                'x app { ens(R) | x<=8 }',
                                'Exemple4_Set.png'
                            ]
                        ]
                    },
                    {
                        type: 'Geometry',
                        label: 'tool-formula-example-geometry',
                        items: [
                            [
                                'Delta ABC sim Delta DEF',
                                'Exemple1_Geometry.png'
                            ],
                            [
                                'seg(EC) cong seg(AB)',
                                'Exemple2_Geometry.png'
                            ],
                            [
                                'seg(AB) perp seg(BC) para seg(DA)',
                                'Exemple3_Geometry.png'
                            ],
                            [
                                'A = 64 degre',
                                'Exemple4_Geometry.png'
                            ]
                        ]
                    },
                    {
                        type: 'Physics',
                        label: 'tool-formula-example-physic',
                        items: [
                            [
                                'vec(F_g) + vec(T) = mvec(a)',
                                'Exemple1_Physics.png'
                            ],
                            [
                                'Delta s = v_i Delta t + 1/2*a Delta t2',
                                'Exemple2_Physics.png'
                            ]
                        ]
                    },
                    {
                        type: 'Chemistry',
                        label: 'tool-formula-example-chemistry',
                        items: [
                            [
                                'nuc10(5) * C^(16)',
                                'Exemple1_Chemistry.png'
                            ],
                            [
                                '[CuNH_3Cl_5]^(-3)',
                                'Exemple2_Chemistry.png'
                            ],
                            [
                                'Ag^(+) + Cl^(-) fd AgCl',
                                'Exemple3_Chemistry.png'
                            ],
                            [
                                'H_2O_2 fd H_2O+ 1/2 * O_2',
                                'Exemple4_Chemistry.png'
                            ],
                            [
                                '6CO_2+ 6H_2O fg C_6H_(12)O_6 + 6O_2',
                                'Exemple5_Chemistry.png'
                            ],
                            [
                                'H_2O_((s)) fd H_2O_((l)) esp esp DeltaH = +6,00kJ',
                                'Exemple6_Chemistry.png'
                            ]
                        ]
                    }
                ];
                const result = [];
                for (let i = 0, el; el = data[i]; i++) {
                    const type = el.type, label = el.label, items = el.items;
                    for (let j = 0, item; item = items[j]; j++) {
                        result.push({
                            value: Ux.FormulaLatexConverter.convert(item[0]),
                            label: CJ.app.t(label),
                            type
                        });
                    }
                }
                return result;
            })(),
            fields: [
                'type',
                'label',
                'value'
            ],
            filters: [{
                    property: 'type',
                    value: 'Functions'
                }]
        };
        return this.callParent(args);
    },
    onListRefresh() {
        this.cleanupExternalComponents();
        this.attachExternalComponents();
    },
    /**
     * @TODO create class examples and move logic there
     * reverts all created mathquill instances
     */
    cleanupExternalComponents() {
        const nodes = this.element.dom.querySelectorAll('.value');
        Ext.TaskQueue.requestWrite(function () {
            Ext.each(nodes, node => {
                // in case when list is is rendering state 
                // mathquill will be absent
                node.mathquill && node.mathquill.revert();
            }, this);
        });
    },
    /**
     * @TODO create class examples and move logic there
     * initialized mathquill instances
     */
    attachExternalComponents() {
        const nodes = this.element.dom.querySelectorAll('.value');
        Ext.TaskQueue.requestWrite(function () {
            Ext.each(nodes, node => {
                node.mathquill = MathQuill.StaticMath(node);
            }, this);
        });
    },
    destroy() {
        this.cleanupExternalComponents();
        return this.callParent(args);
    }
});