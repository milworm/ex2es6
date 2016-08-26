/**
    David converter was used in old didacti 
    */
Ext.define('Ux.FormulaLatexConverter', {
    singleton: true,
    convert(value) {
        const me = this;
        let i = 0;
        let resultExp = '';
        const splitOrder = [
            '=',
            '+',
            '*',
            '/',
            '^',
            '_',
            'fct',
            'terme'
        ];
        while (!resultExp && splitOrder.length > i) {
            resultExp = me.detail(value, splitOrder[i]);
            i++;
        }
        const tempresultExp = resultExp.split('\\:');
        resultExp = tempresultExp.join('\\');
        return resultExp;
    },
    detail(texte, symbol) {
        const me = this;
        const inPar = [];
        let a = 0;    //identifie chaque caractière du string en lui en indiquant dans quel niveau de parenthèse il se trouve
        //identifie chaque caractière du string en lui en indiquant dans quel niveau de parenthèse il se trouve
        for (; texte.length > i; i++) {
            if (texte.charAt(i) == '(') {
                a++;
            } else if (texte.charAt(i) == ')') {
                a--;
            }
            inPar[i] = a;
        }
        a = 0;
        var i = 0;
        const expParts = [];
        const termesList = [];
        const facteursList = [];
        const symbols = '+/^*';    //en écris les texte
        //en écris les texte
        const textIndex = texte.indexOf('texte(');
        if (textIndex != -1 && inPar[textIndex] == 0) {
            for (i = textIndex; i < texte.length; i++) {
                //on cherche l'autre parenthese
                if (texte.charAt(i) == ')') {
                    return `${ me.convert(texte.substring(0, textIndex)) }\\:\\: \\textrm{${ texte.substring(textIndex + 6, i) }} \\: ${ me.convert(texte.substring(i + 1, texte.length)) }`;
                }
            }
        }    //on enlève les espaces
        //on enlève les espaces
        let sansEspace = '';
        for (var i = 0; i < texte.length; i++) {
            if (texte.charAt(i) != ' ') {
                sansEspace += texte.charAt(i);
            }
        }
        texte = sansEspace;    //identifie chaque caractière du string en lui en indiquant dans quel niveau de parenthèse il se trouve
        //identifie chaque caractière du string en lui en indiquant dans quel niveau de parenthèse il se trouve
        inpar = [];
        for (var i = 0; i < texte.length; i++) {
            if (texte.charAt(i) == '(') {
                a++;
            } else if (texte.charAt(i) == ')') {
                a--;
            }
            inPar[i] = a;
        }    //L'égalité
        //L'égalité
        if (symbol == '=') {
            if (texte.indexOf('!=') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('!='))) } \\neq ${ me.convert(texte.substring(texte.indexOf('!=') + 2, texte.length)) }`;
            } else if (texte.indexOf('approx') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('approx'))) } \\approx ${ me.convert(texte.substring(texte.indexOf('approx') + 6, texte.length)) }`;
            } else if (texte.indexOf('cong') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('cong'))) } \\cong ${ me.convert(texte.substring(texte.indexOf('cong') + 4, texte.length)) }`;
            } else if (texte.indexOf('sim') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('sim'))) } \\sim ${ me.convert(texte.substring(texte.indexOf('sim') + 3, texte.length)) }`;
            } else if (texte.indexOf('para') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('para'))) } \\parallel ${ me.convert(texte.substring(texte.indexOf('para') + 4, texte.length)) }`;
            } else if (texte.indexOf('perp') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('perp'))) } \\perp ${ me.convert(texte.substring(texte.indexOf('perp') + 4, texte.length)) }`;
            } else if (texte.indexOf('fd') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('fd'))) } \\rightarrow ${ me.convert(texte.substring(texte.indexOf('fd') + 2, texte.length)) }`;
            } else if (texte.indexOf('fg') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('fg'))) } \\leftarrow ${ me.convert(texte.substring(texte.indexOf('fg') + 2, texte.length)) }`;
            } else if (texte.indexOf('fb') != -1) {
                return `${ me.convert(texte.substring(0, texte.indexOf('fb'))) } \\rightleftarrows  ${ me.convert(texte.substring(texte.indexOf('fb') + 2, texte.length)) }`;
            }
            for (i = 1; i < texte.length; i++) {
                if (texte.charAt(i) == '=' && inPar[i] == 0 && i < texte.length - 1) {
                    return `${ me.convert(texte.substring(0, i)) } = ${ me.convert(texte.substring(i + 1, texte.length)) }`;
                }
                if (texte.charAt(i) == '<' && inPar[i] == 0 && i < texte.length - 1) {
                    if (texte.charAt(i + 1) == '=') {
                        return `${ me.convert(texte.substring(0, i)) } \\leq ${ me.convert(texte.substring(i + 2, texte.length)) }`;
                    } else {
                        return `${ me.convert(texte.substring(0, i)) } < ${ me.convert(texte.substring(i + 1, texte.length)) }`;
                    }
                }
                if (texte.charAt(i) == '>' && inPar[i] == 0 && i < texte.length - 1) {
                    if (texte.charAt(i + 1) == '=') {
                        return `${ me.convert(texte.substring(0, i)) } \\geq ${ me.convert(texte.substring(i + 2, texte.length)) }`;
                    } else {
                        return `${ me.convert(texte.substring(0, i)) } > ${ me.convert(texte.substring(i + 1, texte.length)) }`;
                    }
                }
            }    //L'Addition
        } else if (symbol == '+') {
            for (i = 0; i < texte.length; i++) {
                if (texte.charAt(i) == '+' && inPar[i] == 0 && i < texte.length - 1) {
                    if (texte.charAt(i + 1) == '-') {
                        //s'il est suivie d'un moins
                        termesList.push(`${ me.convert(texte.substring(a, i)) }+`);
                    } else {
                        //s,il n'est pas suivie d'un moins
                        termesList.push(me.convert(texte.substring(a, i)));
                    }
                    a = i + 1;
                } else if (texte.charAt(i) == '-' && inPar[i] == 0 && i > 0) {
                    if (symbols.indexOf(texte.charAt(i - 1)) == -1 && texte.length - 1 >= i && !me.nextToTrig(texte.substring(a, i))) {
                        //si le '-' n'est pas précédé d'un symbol
                        termesList.push(`${ me.convert(texte.substring(a, i)) }#`);    //entre 2 groupement +
                        //entre 2 groupement +
                        a = i + 1;
                    }
                } else if (i < texte.length - 2) {
                    if (texte.substring(i, i + 2) == 'pm' && inPar[i] == 0) {
                        termesList.push(`${ me.convert(texte.substring(a, i)) }##`);
                        i += 1;
                        a = i + 1;
                    }
                }
            }
            if (termesList.length > 0) {
                termesList.push(me.convert(texte.substring(a, texte.length)));    // la fin du string
                // la fin du string
                let somme = termesList[0];
                for (i = 0; i < termesList.length - 1; i++) {
                    if (termesList[i].charAt(termesList[i].length - 1) == '#' && termesList[i].charAt(termesList[i].length - 2) == '#') {
                        //si le dernier termine par deux dièses
                        somme = somme.substring(0, somme.length - 2);    //on enlève les dièses
                        //on enlève les dièses
                        somme += ' \\pm ';
                    } else if (termesList[i].charAt(termesList[i].length - 1) == '#') {
                        //si le dernier termine par un dièse
                        somme = somme.substring(0, somme.length - 1);    //on enlève le dièse
                        //on enlève le dièse
                        somme += ' - ';
                    } else if (termesList[i + 1].charAt(0) != '-') {
                        if (somme.charAt(somme.length - 1) != '+') {
                            somme += '+';
                        }
                    }
                    somme += termesList[i + 1];
                }
                return somme;
            } else {
                return '';    //ce n'est pas une somme
            }    //Multiplication
        } else if (symbol == '*') {
            //on regarde si elle contient le symbole diviser avant
            const foisIndex = texte.indexOf('fois');
            if (foisIndex != -1) {
                if (inPar[foisIndex] == 0) {
                    return `${ me.convert(texte.substring(0, foisIndex)) } \\times  ${ me.convert(texte.substring(foisIndex + 4, texte.length)) }`;
                }
            }
            if (texte.charAt(0) == '-' && inPar[i] == 0 && texte.length > 1) {
                if (texte.charAt(1) == '(') {
                    //si le moins est devant un '('
                    return `-${ me.convert(texte.substring(1, texte.length)) }`;
                }
            }
            for (i = 0; i < texte.length; i++) {
                if (texte.charAt(i) == '*' && inPar[i] == 0) {
                    facteursList.push(me.convert(texte.substring(a, i)));
                    a = i + 1;
                }
            }
            if (facteursList.length > 0) {
                facteursList.push(me.convert(texte.substring(a, texte.length)));
                let product = facteursList[0];
                for (i = 0; i < facteursList.length - 1; i++) {
                    //si le prochain objet est un nombre
                    //ou si le prochain commence est un '-'
                    //ou si le prochain commence est un 'fraction'
                    if ('0123456789-'.indexOf(facteursList[i + 1].charAt(0)) != -1 || facteursList[i + 1].indexOf('\\frac') == 0) {
                        product += ' \\cdot ';
                    }
                    product += facteursList[i + 1];
                }
                return product;
            } else {
                return '';    //ce n'est pas une multiplication
            }    //Fraction
        } else if (symbol == '/') {
            //on regarde si elle contient le symbole diviser avant
            const divIndex = texte.indexOf('div');
            if (divIndex != -1) {
                if (inPar[divIndex] == 0) {
                    return `${ me.convert(texte.substring(0, divIndex)) } \\div ${ me.convert(texte.substring(divIndex + 3, texte.length)) }`;
                }
            }
            for (i = 0; i < texte.length; i++) {
                if (texte.charAt(i) == '/' && inPar[i] == 0) {
                    a = i + 1;
                    var t = texte.substring(0, i);
                    if (t.charAt(0) == '(' && t.charAt(t.length - 1) == ')') {
                        t = texte.substring(1, i - 1);
                    }
                    facteursList.push(me.convert(t));
                    break;
                }
            }
            if (facteursList.length > 0) {
                var t = texte.substring(a, texte.length);
                if (t.charAt(0) == '(' && t.charAt(t.length - 1) == ')') {
                    t = texte.substring(a + 1, texte.length - 1);
                }
                facteursList.push(me.convert(t));
                return `\\frac{${ facteursList[0] }}{${ facteursList[1] }}`;
            } else {
                return '';    //ce n'est pas une fraction
            }    //L'exponentiation
        } else if (symbol == '^') {
            for (i = 0; i < texte.length; i++) {
                if (texte.charAt(i) == '^' && inPar[i] == 0) {
                    a = i + 1;
                    facteursList.push(me.convert(texte.substring(0, i)));
                    break;
                }
            }
            if (facteursList.length > 0) {
                var t = texte.substring(a, texte.length);
                if (t.charAt(0) == '(' && t.charAt(t.length - 1) == ')') {
                    t = texte.substring(a + 1, texte.length - 1);
                }
                facteursList.push(me.convert(t));
                return `${ facteursList[0] }^{${ facteursList[1] }}`;
            } else {
                return '';    //ce n'est pas une fraction
            }    //C'EST un cas: (2x+!)(3x-1)(x-3)
        } else if (texte.charAt(0) == '(' && texte.charAt(texte.length - 1) == ')') {
            const array = [];
            a = 0;    //on cherche la prochain parenthèse
            //on cherche la prochain parenthèse
            for (i = 0; i < texte.length; i++) {
                if (texte.charAt(i) == ')' && inPar[i] == 0) {
                    array.push(me.convert(texte.substring(a + 1, i)));
                    a = i + 1;    //car normalement le prochain caractère est une parenthèse SINON ERREUR
                }
            }
            var reponse = '';
            for (i = 0; i < array.length; i++) {
                reponse += `\\left(${ array[i] }\\right)`;
            }
            return reponse;    // on interprète les fonctions  
        } else if (symbol == 'fct') {
            //on vérifie s'il y a un coefficient de vant la fonction
            const fct = [
                'rac',
                'cosec',
                'sec',
                'cotan',
                'arcsin',
                'arccos',
                'arctan',
                'log',
                'ln',
                'abs',
                'sin',
                'cos',
                'tan',
                'ent',
                'vec',
                'seg',
                'arc',
                'nuc'
            ];
            let containsFct = 1000000;
            for (i = 0; i < fct.length; i++) {
                if (texte.indexOf(fct[i]) != -1) {
                    if (texte.indexOf(fct[i]) < containsFct) {
                        containsFct = texte.indexOf(fct[i]);
                    }
                }
            }
            if (containsFct < texte.length && containsFct > 0) {
                //on elève le coefficient
                return me.convert(texte.substring(0, containsFct)) + me.convert(texte.substring(containsFct, texte.length));
            }
            let inside;
            let outside;
            a = -1;
            let tempv;
            if (texte.length >= 3) {
                if (texte.substring(0, 3) == 'rac') {
                    //fonction racine carrée
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        const radicande = texte.substring(a + 1, texte.length - 1);
                        const radical = texte.substring(3, a);
                        if (radical.length > 0) {
                            return `\\: \\sqrt[${ me.convert(radical) }]{${ me.convert(radicande) }}`;
                        } else {
                            return `\\: \\sqrt{${ me.convert(radicande) }}`;
                        }
                    }
                } else if (texte.substring(0, 3) == 'log') {
                    //fonction logarithmique
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        const log = texte.substring(a + 1, texte.length - 1);
                        const base = texte.substring(3, a);
                        if (base != '') {
                            return `\\log_{${ me.convert(base) }}${ me.convert(log) }`;
                        } else {
                            return `\\log ${ me.convert(log) }`;
                        }
                    }
                } else if (texte.substring(0, 2) == 'ln') {
                    //fonction valeur absolue
                    if (texte.charAt(2) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\ln${ me.convert(texte.substring(3, texte.length - 1)) }`;
                    }
                } else if (texte.substring(0, 3) == 'abs') {
                    //fonction valeur absolue
                    if (texte.charAt(3) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\left |${ me.convert(texte.substring(4, texte.length - 1)) }\\right |`;
                    }
                } else if (texte.substring(0, 3) == 'sin') {
                    //fonction racine carrée
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(3, a);
                        if (outside != '') {
                            return `\\sin^{${ me.convert(outside) }} ${ me.convert(inside) }`;
                        } else {
                            return `\\sin ${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 3) == 'cos') {
                    //fonction valeur absolue
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(3, a);
                        if (outside != '') {
                            return `\\cos^{${ me.convert(outside) }} ${ me.convert(inside) }`;
                        } else {
                            return `\\cos ${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 3) == 'tan') {
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(3, a);
                        if (outside != '') {
                            return `\\tan^{${ me.convert(outside) }} ${ me.convert(inside) }`;
                        } else {
                            return `\\tan ${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 3) == 'sec') {
                    //sec                  
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(3, a);
                        if (outside != '') {
                            return `\\operatorname{sec}^{${ me.convert(outside) }}\\: ${ me.convert(inside) }`;
                        } else {
                            return `\\operatorname{sec} \\:${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 5) == 'cosec') {
                    //fonction valeur absolue
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(5, a);
                        if (outside != '') {
                            return `\\operatorname{cosec}^{${ me.convert(outside) }}\\: ${ me.convert(inside) }`;
                        } else {
                            return `\\operatorname{cosec} \\: ${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 5) == 'cotan') {
                    //fonction valeur absolue
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(5, a);
                        if (outside != '') {
                            return `\\operatorname{cotan}^{${ me.convert(outside) }}\\: ${ me.convert(inside) }`;
                        } else {
                            return `\\operatorname{cotan} \\: ${ me.convert(inside) }`;
                        }
                    }
                } else if (texte.substring(0, 6) == 'arcsin') {
                    //fonction valeur absolue
                    if (texte.charAt(6) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\arcsin ${ me.convert(texte.substring(7, texte.length - 1)) }`;
                    }
                } else if (texte.substring(0, 6) == 'arccos') {
                    //fonction valeur absolue
                    if (texte.charAt(6) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\arccos ${ me.convert(texte.substring(7, texte.length - 1)) }`;
                    }
                } else if (texte.substring(0, 6) == 'arctan') {
                    //fonction valeur absolue
                    if (texte.charAt(6) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\arctan ${ me.convert(texte.substring(7, texte.length - 1)) }`;
                    }
                } else if (texte.substring(0, 3) == 'ent') {
                    //fonction valeur absolue
                    if (texte.charAt(3) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\left[${ me.convert(texte.substring(4, texte.length - 1)) }\\right]`;
                    }
                } else if (texte.substring(0, 3) == 'vec') {
                    //fonction vecteur
                    if (texte.charAt(3) == '(' && texte.charAt(texte.length - 1) == ')') {
                        if (5 == texte.length - 1 && 'abcdefghijklmnopqrstuvwxyz'.indexOf(texte.charAt(4)) != -1) {
                            //si le vecteur a un seul caractère t c,est une minuscule
                            return `\\vec{${ me.convert(texte.substring(4, texte.length - 1)) }}`;
                        } else {
                            return `\\vec{${ me.convert(texte.substring(4, texte.length - 1)) }}`;
                        }
                    }
                } else if (texte.substring(0, 3) == 'seg') {
                    //fonction vecteur
                    if (texte.charAt(3) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\overline{${ me.convert(texte.substring(4, texte.length - 1)) }}`;
                    }
                } else if (texte.substring(0, 3) == 'arc') {
                    //fonction vecteur
                    if (texte.charAt(3) == '(' && texte.charAt(texte.length - 1) == ')') {
                        return `\\widehat{${ me.convert(texte.substring(4, texte.length - 1)) }}`;
                    }
                } else if (texte.substring(0, 3) == 'nuc') {
                    //fonction vecteur
                    for (i = 3; i < texte.length; i++) {
                        if (texte.charAt(i) == '(' && texte.charAt(texte.length - 1) == ')') {
                            a = i;
                            i = texte.length;
                        }
                    }
                    if (a != -1) {
                        inside = texte.substring(a + 1, texte.length - 1);
                        outside = texte.substring(3, a);
                        if (outside != '') {
                            return `_{${ me.convert(outside) }}^{${ me.convert(inside) }}`;
                        }
                    }
                }
            }    //x app { ens(R) | x<=5}
            //x app { ens(R) | x<=5}
            return '';    //ce sont des nombres des variables
        } else if (symbol == 'terme') {
            //c'est un terme
            //coefficient devant un parenthèse
            const parIndex = texte.indexOf('(');
            if (parIndex > 0) {
                if (texte.substring(parIndex - 3, parIndex) == 'ens' && texte.length >= parIndex + 2) {
                    if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(texte.charAt(parIndex + 1)) != -1 && texte.charAt(parIndex + 2) == ')') {
                        //si le vecteur a un seul caractère t c,est une minuscule
                        //return me.convert(texte.substring(0, parIndex - 3)) + '\\mathbb{' + texte.charAt(parIndex + 1) + '}' + me.convert(texte.substring(parIndex + 3, texte.length))
                        return `${ me.convert(texte.substring(0, parIndex - 3)) }${ texte.charAt(parIndex + 1) }${ me.convert(texte.substring(parIndex + 3, texte.length)) }`;
                    }
                }    //on elève le coefficient
                //on elève le coefficient
                if (texte.charAt(texte.indexOf('(') - 1) != '_') {
                    return me.convert(texte.substring(0, parIndex)) + me.convert(texte.substring(parIndex, texte.length));
                }
            }
            var reponse = '';
            const _pos = texte.indexOf('_');
            let p = 0;    //console.log(texte+'  '+_pos)
            //console.log(texte+'  '+_pos)
            if (_pos != -1) {
                //s'il ça suit par une parenthès
                if (texte.charAt(_pos + 1) == '(') {
                    //on cherche pour la prochaine parenthese
                    for (i = _pos + 2; i < texte.length; i++) {
                        if (texte.charAt(i) == ')' && inPar[i] == 0) {
                            p = i;
                            break;
                        }
                    }    //sin on a trouvé la parenthèse de fermeture
                    //sin on a trouvé la parenthèse de fermeture
                    if (p != 0) {
                        reponse = `${ me.convert(texte.substring(0, _pos)) }_{${ me.convert(texte.substring(_pos + 2, p)) }}`;
                        if (p + 1 <= texte.length) {
                            reponse += me.convert(texte.substring(p + 1, texte.length));
                        }
                        return reponse;
                    }
                } else {
                    //S'il n'y a pas de parenthese, un subscript seulement le prochain caracthère
                    reponse = `${ me.convert(texte.substring(0, _pos)) }_{${ me.convert(texte.charAt(_pos + 1)) }}`;
                    if (_pos + 2 <= texte.length) {
                        reponse += me.convert(texte.substring(_pos + 2, texte.length));
                    }
                    return reponse;
                }
            }
            if (texte.indexOf('pi') != -1) {
                //on elève le coefficient
                reponse = '';
                reponse = `${ me.convert(texte.substring(0, texte.indexOf('pi'))) } \\pi `;
                if (texte.indexOf('pi') + 2 <= texte.length) {
                    reponse += me.convert(texte.substring(texte.indexOf('pi') + 2, texte.length));
                }
                return reponse;
            }
            const greek = [
                'pi',
                'theta',
                'mu',
                'delta',
                'Delta',
                'beta',
                'alpha',
                'sigma',
                'Digma',
                'rho',
                'omega',
                'Omega',
                'lambda',
                'phi',
                'infini',
                'union',
                'inter',
                'app',
                'telque',
                'vide',
                'degre',
                'esp'
            ];
            const latexGreek = [
                '\\pi',
                '\\theta',
                '\\mu',
                '\\delta',
                '\\Delta',
                '\\beta',
                '\\alpha',
                '\\sigma',
                '\\Digma',
                '\\rho',
                '\\omega',
                '\\Omega',
                '\\lambda',
                '\\phi',
                '\\infty',
                '\\cup',
                '\\cap',
                '\\in \\:',
                '\\left | \\:',
                '\\varnothing',
                '^\\circ',
                '\\:'
            ];
            for (i = 0; i < greek.length; i++) {
                const greekIndex = texte.indexOf(greek[i]);
                if (greekIndex != -1) {
                    //on elève le coefficient
                    reponse = '';
                    reponse = `${ me.convert(texte.substring(0, greekIndex)) + latexGreek[i] } `;
                    if (greekIndex + greek[i].length <= texte.length) {
                        reponse += me.convert(texte.substring(greekIndex + greek[i].length, texte.length));
                    }
                    return reponse;
                }
            }
            let newCoef = '';
            let coefEnd = -1;
            const vars = [];
            const newProd = [];
            const expoList = [];
            let expoEnd = -1;
            for (i = 0; i < texte.length; i++) {
                if ('0123456789-,.;{}[]_()!?%$&#'.indexOf(texte.charAt(i)) == -1) {
                    // si ce n'est pas un nombre ou un -
                    vars.push(texte.charAt(i));    //c'est une variable
                    //c'est une variable
                    if (coefEnd == -1) {
                        coefEnd = i;
                        expoEnd = i;
                    } else {
                        expoList.push(texte.substring(expoEnd + 1, i));
                        expoEnd = i;
                    }
                }
            }
            let temp = 0;
            if (coefEnd == -1 && vars.length == 0) {
                coefEnd = texte.length;
            }    //pas de variable
            //pas de variable
            if (texte.substring(0, coefEnd) == '-' && vars.length > 0) {
                //commence par un moins et au moins une variable
                newCoef = '-';
            } else if (coefEnd > 0) {
                //coefficient et variable
                newCoef = texte.substring(0, coefEnd);
            } else {
                //pas de coefficient mais variable
                if (texte == '') {
                    newCoef = '';
                } else {
                    temp = 1;
                }
            }
            if (temp != 1) {
                newProd.push(newCoef);
            }
            if (vars.length > 0) {
                expoList.push(texte.substring(expoEnd + 1, texte.length));
            }
            for (i = 0; i < vars.length; i++) {
                if (expoList[i] == '' || expoList[i] == '1') {
                    newProd.push(vars[i]);
                } else {
                    newProd.push(`${ vars[i] }^${ expoList[i] }`);
                }
            }
            let s = 0;    //on remplace les { par des \left\{ et aisni de suite
            //on remplace les { par des \left\{ et aisni de suite
            for (i = 0; i < newProd.length; i++) {
                for (s = 0; s < newProd[i].length; s++) {
                    if (newProd[i].charAt(s) == '{') {
                        newProd[i] = `${ newProd[i].substring(0, s) } \\left\\{ ${ newProd[i].substring(s + 1, newProd[i].length) }`;
                        s += 7;
                    } else if (newProd[i].charAt(s) == '}') {
                        newProd[i] = `${ newProd[i].substring(0, s) } \\right\\} ${ newProd[i].substring(s + 1, newProd[i].length) }`;
                        s += 8;
                    } else if (newProd[i].charAt(s) == '%') {
                        newProd[i] = `${ newProd[i].substring(0, s) } \\% ${ newProd[i].substring(s + 1, newProd[i].length) }`;
                        s += 2;
                    } else if (newProd[i].charAt(s) == '$') {
                        newProd[i] = `${ newProd[i].substring(0, s) } \\$ ${ newProd[i].substring(s + 1, newProd[i].length) }`;
                        s += 2;
                    } else if (newProd[i].charAt(s) == '?') {
                        newProd[i] = `${ newProd[i].substring(0, s) } \\:? ${ newProd[i].substring(s + 1, newProd[i].length) }`;
                        s += 3;
                    }
                }
            }
            var reponse = '';
            if (newProd.length > 1) {
                let multi = newProd[0];
                for (i = 0; i < newProd.length - 1; i++) {
                    if ('0123456789-'.indexOf(newProd[i + 1].charAt(0)) != -1) {
                        multi += ' \\cdot ';
                    }
                    multi += newProd[i + 1];
                }
                reponse = multi;
            } else {
                reponse = newProd[0];
            }
            return reponse;
        }
        return '';    //juste au cas
    },
    nextToTrig(str) {
        const trigo = [
            'sin',
            'cos',
            'tan',
            'sec',
            'cosec',
            'cotan',
            'arcsin',
            'arccos',
            'arctan'
        ];
        for (let z = 0; z < trigo.length; z++) {
            if (str.substring(str.length - trigo[z].length, str.length) == trigo[z]) {
                return true;
            }
        }
        return false;
    }
});