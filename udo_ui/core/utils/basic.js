
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

if (!Array.prototype.isEmpty){
    Array.prototype.isEmpty = function(){
        return (this.length === 0);
    };
};

if (!Array.prototype.subArray){
    Array.prototype.subArray=function(start,end){
        if (!end) {
            end = -1;
        } 
        return this.slice(start, this.length+1-(end*-1));
    }
};

if (!Array.prototype.hasObject) {
    Array.prototype.hasObject = (
        !Array.indexOf ? function (o)
        {
            var l = this.length + 1;
            while (l -= 1) {
                if (this[l - 1] === o) {
                    return true;
                }
            }
            return false;
        } : function (o)
        {
            return (this.indexOf(o) !== -1);
        }
    );
};

if (!Array.prototype.clear) {
    Array.prototype.clear = function() {//Add a new method to the Array Object
        while (this.length > 0) {
            this.pop();
        }
    }
};

/**
 * object.padding(number, string)
 * Transform the string object to string of the actual width filling by the padding character (by default ' ')
 * Negative value of width means left padding, and positive value means right one
 *
 * @param       number  Width of string
 * @param       string  Padding chacracter (by default, ' ')
 * @return      string
 * @access      public
 */
if (!String.prototype.padding) {
    String.prototype.padding = function(n, c) {
            var val = this.valueOf();
            if ( Math.abs(n) <= val.length ) {
                    return val;
            }
            var m = Math.max((Math.abs(n) - this.length) || 0, 0);
            var pad = Array(m + 1).join(String(c || ' ').charAt(0));
            return (n < 0) ? pad + val : val + pad;
    };
}



//TODO: deprecated, use sanitize
function replaceTag(tag) {
    return (tagsToReplace[tag] || tag);
};

//TODO: deprecated, use sanitize
function safe_tags_replace(str) {
    return sanitize(str);
};

function sanitize(data) {
    if ('undefined' === typeof data || null === data) return '';
    return $('<div>').text(data).html();
};

/**
 * isDefined(object, property chain)
 * Checks if any object is missing in complex object chain
 *
 * @param       object  Object root
 * @param       string  Object chain
 * @return      boolean
 * @access      public
 */
function isDefined(value, path) {
    path.split('.').forEach(function(key) { value = value && value[key]; });
    return (typeof value != 'undefined' && value !== null);
};

