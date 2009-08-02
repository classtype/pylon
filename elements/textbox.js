/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */

// #ifdef __JTEXTBOX || __JSECRET || __JTEXTAREA || __JINPUT || __INC_ALL
// #define __WITH_PRESENTATION 1

//@todo DOCUMENT the modules too

/**
 * Element displaying a rectangular area wich allows a
 * user to type information. The information typed can be
 * restricted by using masking. The information can also
 * be hidden from view when used in password mode. By adding an 
 * {@link element.autocomplete autocomplete element} as a child the 
 * value for the textbox can be looked up as you type. By setting the 
 * {@link element.textbox.attribute.mask mask atribute}, complex data input 
 * validation is done while the users types.
 * Example:
 * Sets the value based on data loaded into this component.
 * <code>
 *  <a:textbox ref="@name" />
 * </code>
 *
 * @constructor
 * @define input, secret, textarea, textbox
 * @allowchild autocomplete, {smartbinding}
 * @addnode elements
 *
 * @inherits apf.DataBinding
 * @inherits apf.Presentation
 * @inherits apf.Validation
 * @inherits apf.XForms
 *
 * @author      Ruben Daniels (ruben AT javeline DOT com)
 * @version     %I%, %G%
 * @since       0.1
 *
 * @binding value  Determines the way the value for the element is retrieved 
 * from the bound data.
 * Example:
 * Sets the value based on data loaded into this component.
 * <code>
 *  <a:textbox>
 *      <a:bindings>
 *          <a:value select="@name" />
 *      </a:bindings>
 *  </a:textbox>
 * </code>
 * Example:
 * A shorter way to write this is:
 * <code>
 *  <a:textbox ref="@name" />
 * </code>
 *
 * @event click     Fires when the user presses a mousebutton while over this element and then let's the mousebutton go. 
 * @event mouseup   Fires when the user lets go of a mousebutton while over this element. 
 * @event mousedown Fires when the user presses a mousebutton while over this element. 
 * @event keyup     Fires when the user lets go of a keyboard button while this element is focussed. 
 *   object:
 *   {Number}  keyCode   which key was pressed. This is an ascii number.
 * @event clear     Fires when the content of this element is cleared. 
 */
apf.input    =
apf.secret   =
apf.password =
apf.textarea =
apf.email    = // HTML5 email element
apf.textbox  = apf.component(apf.NODE_VISIBLE, function(){
    this.$focussable       = true; // This object can get the focus
    var masking            = false;
    var _self              = this;

    /**** Properties and Attributes ****/

    //this.realtime          = false;
    this.value             = "";
    this.isContentEditable = true;
    this.multiline         = this.tagName == "textarea" ? true : false;

    this.$booleanProperties["focusselect"] = true;
    this.$booleanProperties["realtime"]    = true;
    this.$supportedProperties.push("value", "mask", "initial",
        "focusselect", "realtime", "type");

    /**
     * @attribute {String} value the text of this element
     * @todo apf3.0 check use of this.$propHandlers["value"].call
     */
    this.$propHandlers["value"] = function(value, prop, initial){
        // Set Value
        if (this.isHTMLBox) {
            if (this.oInt.innerHTML != value)
                this.oInt.innerHTML = value;
        }
        else if (this.oInt.value != value)
            this.oInt.value = value;
        
        if (this.oButton)
            this.oButton.style.display = value && !initial ? "block" : "none";
    };

    //See validation
    var oldPropHandler = this.$propHandlers["maxlength"];
    this.$propHandlers["maxlength"] = function(value, prop){
        oldPropHandler.call(this, value, prop);

        //Special validation support using nativate max-length browser support
        if (this.oInt.tagName.toLowerCase().match(/input|textarea/))
            this.oInt.maxLength = parseInt(value) || null;
    };

    /**
     * @attribute {String} mask a complex input pattern that the user should
     * adhere to. This is a string which is a combination of special and normal
     * characters. Then comma seperated it has two options. The first option
     * specifies whether the non input characters (the chars not typed by the
     * user) are in the value of this element. The second option specifies the
     * character that is displayed when the user hasn't yet filled in a
     * character.
     *   Possible values:
     *   0  Any digit
     *   1  The number 1 or 2.
     *   9  Any digit or a space.
     *   #  User can enter a digit, space, plus or minus sign.
     *   L  Any alpha character, case insensitive.
     *   ?  Any alpha character, case insensitive or space.
     *   A  Any alphanumeric character.
     *   a  Any alphanumeric character or space.
     *   X  Hexadecimal character, case insensitive.
     *   x  Hexadecimal character, case insensitive or space.
     *   &  Any whitespace.
     *   C  Any character.
     *   !  Causes the input mask to fill from left to right instead of from right to left.
     *   '  The start or end of a literal part.
     *   "  The start or end of a literal part.
     *   >  Converts all characters that follow to uppercase.
     *   <  Converts all characters that follow to lowercase.
     *   \  Cancel the special meaning of a character.
     * Example:
     * An american style phone number.
     * <code>
     *  <a:textbox mask="(000)0000-0000;;_" />
     * </code>
     * Example:
     * A dutch postal code
     * <code>
     *  <a:textbox mask="0000 AA;;_" />
     * </code>
     * Example:
     * A date
     * <code>
     *  <a:textbox mask="00-00-0000;;_" datatype="xsd:date" />
     * </code>
     * Example:
     * A serial number
     * <code>
     *  <a:textbox mask="'WCS74'0000-00000;1;_" />
     * </code>
     * Example:
     * A MAC address
     * <code>
     *  <a:textbox mask="XX-XX-XX-XX-XX-XX;;_" />
     * </code>
     */
    this.$propHandlers["mask"] = function(value){
        if (this.mask.toLowerCase() == "password")// || !apf.hasMsRangeObject)
            return;

        if (!value) {
            throw new Error("Not Implemented");
        }

        if (!masking) {
            masking = true;
            this.implement(apf.textbox.masking);
            this.focusselect = false;
            this.realtime    = false;
        }

        this.setMask(this.mask);
    };

    /**
     * @attribute {String} initial-message the message displayed by this element
     * when it doesn't have a value set. This property is inherited from parent
     * nodes. When none is found it is looked for on the appsettings element.
     */
    this.$propHandlers["initial-message"] = function(value){
        this.initialMsg = value
            || apf.getInheritedAttribute(this.$aml, "initial-message");

        if (this.initialMsg) {
            //#ifdef __WITH_WINDOW_FOCUS
            if (apf.hasFocusBug)
                this.oInt.onblur();
            //#endif
            this.$propHandlers["value"].call(this, this.initialMsg, null, true);
        }
    };

    /**
     * @attribute {Boolean} realtime whether the value of the bound data is
     * updated as the user types it, or only when this element looses focus or
     * the user presses enter.
     */
    this.$propHandlers["realtime"] = function(value){
        this.realtime = typeof value == "boolean"
            ? value
            : apf.isTrue(apf.getInheritedAttribute(this.$aml, "realtime")) || false;
    };

    /**
     * @attribute {Boolean} focusselect whether the text in this element is
     * selected when this element receives focus.
     */
    this.$propHandlers["focusselect"] = function(value){
        this.oInt.onmousedown = function(){
            _self.focusselect = false;
        };

        this.oInt.onmouseup  =
        this.oInt.onmouseout = function(){
            _self.focusselect = value;
        };
    };

    /**
     * @attribute {String} type the type or function this element represents.
     * This can be any arbitrary name. Although there are some special values.
     *   Possible values:
     *   username   this element is used to type in the name part of login credentials.
     *   password   this element is used to type in the password part of login credentials.
     */
    this.$propHandlers["type"] = function(value){
        if (value && "password|username".indexOf(value) > -1
          && typeof this.focusselect == "undefined") {
            this.focusselect = true;
            this.$propHandlers["focusselect"].call(this, true);
        }
    };

    /**** Public Methods ****/

    /**
     * Sets the value of this element. This should be one of the values
     * specified in the values attribute.
     * @param {String} value the new value of this element
     */
    this.setValue = function(value){
        return this.setProperty("value", value);
    };

    /**
     * Returns the current value of this element.
     * @return {String}
     */
    this.getValue = function(){
        var v = this.isHTMLBox ? this.oInt.innerHTML : this.oInt.value;
        return v == this.initialMsg ? "" : v.replace(/\r/g, "");
    };

    /**
     * Selects the text in this element.
     */
    this.select   = function(){ this.oInt.select(); };

    /**
     * Deselects the text in this element.
     */
    this.deselect = function(){ this.oInt.deselect(); };

    /**** Private Methods *****/

    this.$enable  = function(){ this.oInt.disabled = false; };
    this.$disable = function(){ this.oInt.disabled = true; };

    this.$insertData = function(str){
        return this.setValue(str);
    };

    /**
     * @private
     */
    this.insert = function(text){
        if (apf.hasMsRangeObject) {
            try {
                this.oInt.focus();
            }
            catch(e) {}
            var range = document.selection.createRange();
            if (this.oninsert)
                text = this.oninsert(text);
            range.pasteHTML(text);
            range.collapse(true);
            range.select();
        }
        else {
            this.oInt.value += text;
        }
    };

    this.$clear = function(){
        this.value = "";//@todo what about property binding?
        
        if (this.initialMsg && apf.window.focussed != this) {
            this.$propHandlers["value"].call(this, this.initialMsg, null, true);
            apf.setStyleClass(_self.oExt, _self.baseCSSname + "Initial");
        }
        else {
            this.$propHandlers["value"].call(this, "");
        }
        
        if (!this.oInt.tagName.toLowerCase().match(/input|textarea/i)) {
            if (apf.hasMsRangeObject) {
                try {
                    var range = document.selection.createRange();
                    range.moveStart("sentence", -1);
                    //range.text = "";
                    range.select();
                }
                catch(e) {}
            }
        }
        
        this.dispatchEvent("clear");
    };

    this.$keyHandler = function(key, ctrlKey, shiftKey, altKey, e){
        if (this.oButton && key == 27) {
            this.clear();
            this.blur();
        }
        
        if (this.dispatchEvent("keydown", {
            keyCode   : key,
            ctrlKey   : ctrlKey,
            shiftKey  : shiftKey,
            altKey    : altKey,
            htmlEvent : e}) === false)
                return false;

        // @todo: revisit this IF statement - dead code?
        if (false && apf.isIE && (key == 86 && ctrlKey || key == 45 && shiftKey)) {
            var text = window.clipboardData.getData("Text");
            if ((text = this.dispatchEvent("keydown", {
                text : this.onpaste(text)}) === false))
                    return false;
            if (!text)
                text = window.clipboardData.getData("Text");

            this.oInt.focus();
            var range = document.selection.createRange();
            range.text = "";
            range.collapse();
            range.pasteHTML(text.replace(/\n/g, "<br />").replace(/\t/g, "&nbsp;&nbsp;&nbsp;"));

            return false;
        }
    };

    var fTimer;
    this.$focus = function(e){
        if (!this.oExt || this.oExt.disabled)
            return;

        this.$setStyleClass(this.oExt, this.baseCSSname + "Focus");

        if (this.initialMsg && this.oInt.value == this.initialMsg) {
            this.$propHandlers["value"].call(this, "", null, true);
            apf.setStyleClass(this.oExt, "", [this.baseCSSname + "Initial"]);
        }
        
        function delay(){
            try {
                if (!fTimer || document.activeElement != _self.oInt) {
                    _self.oInt.focus();
                }
                else {
                    clearInterval(fTimer);
                    return;
                }
            }
            catch(e) {}

            if (masking)
                _self.setPosition();

            if (_self.focusselect)
                _self.select();
        };

        if ((!e || e.mouse) && apf.isIE) {
            clearInterval(fTimer);
            fTimer = setInterval(delay, 1);
        }
        else
            delay();
    };

    this.$blur = function(e){
        if (!this.oExt)
            return;
        
        if (!this.realtime)
            this.change(this.getValue());

        this.$setStyleClass(this.oExt, "", [this.baseCSSname + "Focus"]);

        if (this.initialMsg && this.oInt.value == "") {
            this.$propHandlers["value"].call(this, this.initialMsg, null, true);
            apf.setStyleClass(this.oExt, this.baseCSSname + "Initial");
        }

        /*if (apf.hasMsRangeObject) {
            var r = this.oInt.createTextRange();
            r.collapse();
            r.select();
        }*/

        try {
            if (apf.isIE || !e || e.srcElement != apf.window)
                this.oInt.blur();
        }
        catch(e) {}

        // check if we clicked on the oContainer. ifso dont hide it
        if (this.oContainer) {
            setTimeout("var o = apf.lookup(" + this.uniqueId + ");\
                o.oContainer.style.display = 'none'", 100);
        }
        
        clearInterval(fTimer);
    };

    /**** Init ****/

    this.$draw = function(){
        //Build Main Skin
        this.oExt = this.$getExternal(null, null, function(oExt){
            var mask = this.$aml.getAttribute("mask");
            if ("secret|password".indexOf(this.tagName) > -1)
                this.$aml.setAttribute("type", "password");
            if ((typeof mask == "string" && mask.toLowerCase() == "password")
              || this.$aml.getAttribute("type") == "password") {
                this.$aml.removeAttribute("mask");
                this.$getLayoutNode("main", "input").setAttribute("type", "password");
            }
            //#ifdef __WITH_HTML5
            else if (this.tagName == "email") {
                this.datatype = "apf:email";
                this.$propHandlers["datatype"].call(this, "apf:email", "datatype");
            }
            else if (this.tagName == "url") {
                this.datatype = "apf:url";
                this.$propHandlers["datatype"].call(this, "apf:url", "datatype");
            }
            //#endif

            oExt.setAttribute("onmousedown", "this.host.dispatchEvent('mousedown', {htmlEvent : event});");
            oExt.setAttribute("onmouseup",   "this.host.dispatchEvent('mouseup', {htmlEvent : event});");
            oExt.setAttribute("onclick",     "this.host.dispatchEvent('click', {htmlEvent : event});");
        });
        this.oInt    = this.$getLayoutNode("main", "input", this.oExt);
        this.oButton = this.$getLayoutNode("main", "button", this.oExt);

        if (!apf.hasContentEditable && "input|textarea".indexOf(this.oInt.tagName.toLowerCase()) == -1) {
            var node  = this.oInt;
            this.oInt = node.parentNode.insertBefore(document.createElement("textarea"), node);
            node.parentNode.removeChild(node);
            this.oInt.className = node.className;
            if (this.oExt == node)
                this.oExt = this.oInt;
        }
        
        if (this.oButton) {
            this.oButton.onmousedown = function(){
                _self.clear();
                _self.focus({mouse:true});
            }
        }

        //@todo for skin switching this should be removed
        if (this.oInt.tagName.toLowerCase() == "textarea") {
            this.addEventListener("focus", function(e){
                //if (this.multiline != "optional")
                    //e.returnValue = false
            });
        }

        this.oInt.onselectstart = function(e){
            if (!e) e = event;
            e.cancelBubble = true;
        }
        this.oInt.host = this;

        this.oInt.onkeydown = function(e){
            e = e || window.event;
            
            if (this.disabled) {
                e.returnValue = false;
                return false;
            }

            //Change
            if (!_self.realtime) {
                var value = _self.getValue();
                if (e.keyCode == 13 && value != this.value)
                    _self.change(value);
            }
            else if (apf.isSafari && _self.xmlRoot && _self.getValue() != this.value) //safari issue (only old??)
                setTimeout("var o = apf.lookup(" + _self.uniqueId + ");\
                    o.change(o.getValue())");

            if (_self.multiline == "optional" && e.keyCode == 13 && !e.shiftKey
              || e.ctrlKey && (e.keyCode == 66 || e.keyCode == 73
              || e.keyCode == 85)) {
                e.returnValue = false;
                return false;
            }

            //Autocomplete
            if (_self.oContainer) {
                var oTxt    = _self;
                var keyCode = e.keyCode;
                setTimeout(function(){
                    oTxt.fillAutocomplete(keyCode);
                });
            }

            //Non masking
            if (!_self.mask) {
                return _self.$keyHandler(e.keyCode, e.ctrlKey,
                    e.shiftKey, e.altKey, e);
            }
        };

        this.oInt.onkeyup = function(e){
            if (!e)
                e = event;

            var keyCode = e.keyCode;
            
            if (_self.oButton)
                _self.oButton.style.display = this.value ? "block" : "none";

            if (_self.realtime) {
                setTimeout(function(){
                    if (!_self.mask && _self.getValue() != _self.value)
                        _self.change(_self.getValue()); //this is a hack
                    _self.dispatchEvent("keyup", {keyCode : keyCode});//@todo
                });
            }
            else {
                _self.dispatchEvent("keyup", {keyCode : keyCode});//@todo
            }

            //#ifdef __WITH_VALIDATION
            if (_self.isValid() && e.keyCode != 13 && e.keyCode != 17)
                _self.clearError();
            //#endif
        };

        //#ifdef __WITH_WINDOW_FOCUS
        if (apf.hasFocusBug)
            apf.sanitizeTextbox(this.oInt);
        //#endif

        if (apf.hasAutocompleteXulBug)
            this.oInt.setAttribute("autocomplete", "off");

        if (!this.oInt.tagName.toLowerCase().match(/input|textarea/)) {
            this.isHTMLBox = true;

            this.oInt.unselectable    = "Off";
            this.oInt.contentEditable = true;
            this.oInt.style.width     = "1px";

            this.oInt.select = function(){
                var r = document.selection.createRange();
                r.moveToElementText(this);
                r.select();
            }
        };

        this.oInt.deselect = function(){
            if (!document.selection) return;

            var r = document.selection.createRange();
            r.collapse();
            r.select();
        };
    };

    this.$loadAml = function(x){
        //Autocomplete
        var ac = $xmlns(x, "autocomplete", apf.ns.aml)[0];
        if (ac) {
            this.implement(apf.textbox.autocomplete);
            this.initAutocomplete(ac);
        }

        if (this.ref)
            this.oInt.setAttribute("name", 
              this.ref.split("/").pop().split("::").pop()
                .replace(/[\@\.\(\)]*/g, ""));

        if (typeof this.realtime == "undefined")
            this.$propHandlers["realtime"].call(this);

        if (apf.isOnlyChild(x.firstChild, [3,4]))
            this.$handlePropSet("value", x.firstChild.nodeValue.trim());
        else if (!ac)
            apf.AmlParser.parseChildren(this.$aml, null, this);
    };

    this.$destroy = function(){
        if (this.oButton)
            this.oButton.onmousedown = null;
        
        this.oInt.onkeypress     =
        this.oInt.onmouseup      =
        this.oInt.onmouseout     =
        this.oInt.onmousedown    =
        this.oInt.onkeydown      =
        this.oInt.onkeyup        =
        this.oInt.onselectstart  = null;
    };
}).implement(
    //#ifdef __WITH_DATABINDING
    apf.DataBinding,
    //#endif
    //#ifdef __WITH_VALIDATION
    apf.Validation,
    //#endif
    //#ifdef __WITH_XFORMS
    apf.XForms,
    //#endif
    apf.Presentation
);

// #endif
