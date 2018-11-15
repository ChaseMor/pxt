/// <reference path="../../localtypings/blockly.d.ts" />


namespace pxtblockly {

    export interface FieldColourNumberOptions extends Blockly.FieldCustomOptions {
        colours?: string; // parsed as a JSON array
        columns?: string; // parsed as a number
        className?: string;
        valueMode?: FieldColourValueMode;
    }

    export class FieldNewColorNumber extends Blockly.FieldColour implements Blockly.FieldCustom {
        public isFieldCustom_ = true;

        protected colour_: string;

        private colorPicker_: goog.ui.ColorPicker;
        private className_: string;
        private valueMode_: FieldColourValueMode = "rgb";
        private colorBlock: Element;

        constructor(text: string, params: FieldColourNumberOptions, opt_validator?: Function) {
            super(text, opt_validator);
            if (params.colours)
                this.setColours(JSON.parse(params.colours));
            else if (pxt.appTarget.runtime && pxt.appTarget.runtime.palette) {
                let p = pxt.Util.clone(pxt.appTarget.runtime.palette);
                p[0] = "#dedede";
                this.setColours(p);
            }

            if (params.columns) this.setColumns(parseInt(params.columns));
            if (params.className) this.className_ = params.className;
            if (params.valueMode) this.valueMode_ = params.valueMode;


        }

        init() {
            super.init();
            this.colorBlock = Blockly.utils.createSvgElement('path', {
                'fill': this.getValue(true),
                'd': "m 75, 5 h 5a 15 15 0 0 1 0 30 h -5a 15 15 0 0 1 0 -30 z"
            });
            this.sourceBlock_.getSvgRoot().appendChild(this.colorBlock);
        }

        /**
         * Return the current colour.
         * @param {boolean} opt_asHex optional field if the returned value should be a hex
         * @return {string} Current colour in '#rrggbb' format.
         */
        getValue(opt_asHex?: boolean) {
            if (opt_asHex) return this.colour_;
            switch (this.valueMode_) {
                case "hex":
                    return `"${this.colour_}"`;
                case "rgb":
                    if (this.colour_.indexOf('#') > -1) {
                        return `0x${this.colour_.replace(/^#/, '')}`;
                    }
                    else {
                        return this.colour_;
                    }
                case "index":
                    return this.getColours_().indexOf(this.colour_).toString();
            }
            return this.colour_;
        }

        /**
         * Set the colour.
         * @param {string} colour The new colour in '#rrggbb' format.
         */
        setValue(colour: string) {
            if (colour.indexOf('0x') > -1) {
                colour = `#${colour.substr(2)}`;
            }
            else if (this.valueMode_ === "index") {
                const allColors = this.getColours_();
                if (allColors.indexOf(colour) === -1) {
                    // Might be the index and not the color
                    const i = parseInt(colour);
                    if (!isNaN(i) && i >= 0 && i < allColors.length) {
                        colour = allColors[i];
                    }
                    else {
                        colour = allColors[0];
                    }
                }
            }

            if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
                this.colour_ != colour) {
                Blockly.Events.fire(new (Blockly as any).Events.BlockChange(
                    this.sourceBlock_, 'field', this.name, this.colour_, colour));
            }
            this.colour_ = colour;
            if (this.colorBlock) {
                this.colorBlock.setAttribute("fill", colour);
                //this.sourceBlock_.setColour(colour, colour, colour);

            }
        }

        showEditor_() {
            super.showEditor_();
            if (this.className_ && this.colorPicker_)
                Blockly.utils.addClass((this.colorPicker_.getElement()), this.className_);

            /*let circle = Blockly.utils.createSvgElement('circle', {
                'cx': "50",
                'cy': "50",
                'r': "40",
                'stroke': "black",
                'stroke-width': "3",
                'fill': "red"
            }, null);
            console.log("adding");
            this.sourceBlock_.getSvgRoot().appendChild(circle);*/
            
            //;
        }

        getColours_(): string[] {
            return (this as any).colours_;
        }
    }
}




