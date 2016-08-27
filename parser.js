
/*
	Call this function to transfor an nbt string into a javascript object
*/
function toObject(str){
    str = str.trim();
    if(str.length == 0){
		throw "Cannot parse empty string";
    }else if(validateStr(str) != 1){
		throw "Encountered multiple top tags, only one expected";
	}else{
        return cloneObj(parseObject("tag", str).value);
    }
}

//TODO optimize ???
function cloneObj(obj){
    return JSON.parse(JSON.stringify(obj));
}

function validateStr(str){
    var topLevelTagCount = 0;
    var escaped = false;
    var stack = [];
    for (var i = 0; i < str.length; ++i){
        var currentChar = str[i];
        if(currentChar == '"'){
            if(isEscaped(str, i)){
                if(!escaped){
                    throw "Validation : Illegal use of \\\" at :" + i + " " + str;
                }
            }
            else{
                escaped = !escaped;
            }
        }
        else if(!escaped){
            if(currentChar != "{" && currentChar != "["){
                if(currentChar == "}" && (stack.length == 0 || stack.pop() != "{")){
                    throw "Validation : Unbalanced curly brackets {} at : " + i;
                }

                if(currentChar == "]" && (stack.length == 0 || stack.pop() != "[")){
                    throw "Validation : Unbalanced square brackets [] at :" + i + " " + str;
                }
            }
            else{
                if(stack.length == 0){
                    ++topLevelTagCount;
                }
                stack.push(currentChar);
            }
        }
    }

    if(escaped){
        throw "Validation : Unbalanced quotation at : " + i;
    }
    else if(stack.length > 0){
        throw "Validation : Unbalanced brackets at : " + i;
    }
    else{
        if(topLevelTagCount == 0 && !str.length > 0){
            topLevelTagCount = 1;
        }
        return topLevelTagCount;
    }
}

var matcherIntArray = "\\[[-+\\d|,\\s]+\\]";

function parseObject(topTag, str){
    str = str.trim();
    var keyValueStr = "";
    var endChar;

    if(str.startsWith("{")){
        str = str.substring(1, str.length - 1);
        var object = {};

        for (object = {}; str.length > 0; str = str.substring(keyValueStr.length + 1)){
            keyValueStr = getKeyValue(str, true);

            if(keyValueStr.length > 0){
                var obj = getObject(keyValueStr, false);
                object[obj.key] = obj.value;
            }

            if(str.length < keyValueStr.length + 1){
                break;
            }

            endChar = str[keyValueStr.length];

            if(endChar != "," && endChar != "{" && endChar != "}" && endChar != "[" && endChar != "]"){
                throw "Unexpected token \'" + endChar + "\' at: " + keyValueStr.length;
            }
        }

        return {key:topTag,value:object};
    }
    else if(str.startsWith("[") && !str.match(matcherIntArray)){
        str = str.substring(1, str.length - 1);
        var array = [];

        for (array = []; str.length > 0; str = str.substring(keyValueStr.length + 1)){
            keyValueStr = getKeyValue(str, false);

            if(keyValueStr.length > 0){
                var obj = getObject(keyValueStr, true);
                array.push(obj.value);
            }

            if(str.length < keyValueStr.length + 1){
                break;
            }

            endChar = str[keyValueStr.length];

            if(endChar != "," && endChar != "{" && endChar != "}" && endChar != "[" && endChar != "]"){
                throw "Unexpected token \'" + endChar + "\' at: " + keyValueStr.length;
            }
        }

        return {key:topTag,value:array};
    }
    else
    {
        return {key:topTag,value:str};
    }

}

function getKeyValue(str, throwError){
    var keyIndex = getIndexToChar(str, ':');
    var valueIndex = getIndexToChar(str, ',');
    if(throwError){
        if(keyIndex == -1){
            throw "Unable to locate name/value separator for string : " + str;
        }

        if(valueIndex != -1 && valueIndex < keyIndex){
            throw "Name error at : " + str;
        }
    }
    else if(keyIndex == -1 || keyIndex > valueIndex){
        keyIndex = -1;
    }
    return getValue(str, keyIndex);
}

function getValue(str, startIndex){
    var stack = [];
    var endIndex = startIndex + 1;
    var flag1 = false;
    var flag2 = false;
    var flag3 = false;

    for (var i = 0; endIndex < str.length; ++endIndex){
        var currentChar = str[endIndex];

        if(currentChar == "\""){
            if(isEscaped(str, endIndex)){
                if(!flag1){
                    throw "Illegal use of \\\" at ; " + endIndex;
                }
            }else{
                flag1 = !flag1;

                if(flag1 && !flag3){
                    flag2 = true;
                }

                if(!flag1){
                    i = endIndex;
                }
            }
        }else if(!flag1){
            if(currentChar != "{" && currentChar != "["){
                if(currentChar == "}" && (stack.length == 0 || stack.pop() != "{")){
                    throw "Unbalanced curly brackets {}: " + str;
                }

                if(currentChar == "]" && (stack.length == 0 || stack.pop() != "[")){
                    throw "Unbalanced square brackets []: " + str;
                }

                if(currentChar == "," && stack.length == 0){
                    return str.substring(0, endIndex);
                }
            }
            else{
                stack.push(currentChar);
            }
        }
    
        if(currentChar.match("\\S")){
            if(!flag1 && flag2 && i != endIndex){
                return str.substring(0, i + 1);
            }
            flag3 = true;
        }
    }
    return str.substring(0, endIndex);
}

function getObject(str, noError){
    var key = parseKey(str, noError);
    var val = parseValue(str, noError);
    return parseObject(key, val);
}

function parseKey(str, noError){
    if(noError){
        str = str.trim();

        if(str.startsWith("{") || str.startsWith("[")){
            return "";
        }
    }

    var index = getIndexToChar(str, ':');

    if(index == -1){
        if(noError){
            return "";
        }
        else{
            throw "Unable to locate name/value separator for string: " + str;
        }
    }
    else{
        return str.substring(0, index).trim();
    }
}

function parseValue(str, noError){
    if(noError){
        str = str.trim();

        if(str.startsWith("{") || str.startsWith("[")){
            return str;
        }
    }

    var index = getIndexToChar(str, ':');

    if(index == -1){
        if(noError){
            return str;
        }
        else{
            throw "Unable to locate name/value separator for string: " + str;
        }
    }
    else{
        return str.substring(index + 1).trim();
    }
}

function getIndexToChar(str, charTarget){
    var i = 0;

    for (var escaped = true; i < str.length; ++i){
        var currentChar = str[i];

        if(currentChar == '"'){
            if(!isEscaped(str, i)){
                escaped = !escaped;
            }
        }
        else if(escaped){
            if(currentChar == charTarget){
                return i;
            }

            if(currentChar == "{" || currentChar == "["){
                return -1;
            }
        }
    }
    return -1;
}

function isEscaped(str, i){
    return i > 0 && str[i - 1] == "\\" && !isEscaped(str, i - 1);
}


function rebuild(data){
	if(data == null){
		return "";
	}
	var type = typeof(data);
	if(type == "number"){
		return data.toString();
	}else if(type == "string"){
		if(data.startsWith("\"")){
			return data;
		}else if(!isValid(data)){
			return escapeStr(data);
		}
		return data;
	}else if(data instanceof Array){
		var elems = [];
		for(var i in data){
			elems.push(rebuild(data[i]));
		}
		return "[" + elems.join(",") + "]";
	}else if(type == "object"){
		var elems = [];
		for(var k in data){
			elems.push(removeQuoteStr(k) + ":" + rebuild(data[k]));
		}
		return "{" + elems.join(",") + "}";
	}else{
		console.log("unknown type : " + type + " " + data);
	}
}
