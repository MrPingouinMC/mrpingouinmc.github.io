var fixType = ["entity", "block", "item", "command", "json", "selector"]
var walkerTypeFromCommand = {"blockdata":"block","clear":"item","entitydata":"entity","fill":"block","give":"item","setblock":"block","summon":"entity","testforblock":"block","scoreboard":"entity","replaceitem":"item","tellraw":"json","title":"json"}
var commandsNBTIndexes = {"blockdata":4,"clear":5,"entitydata":2,"fill":10,"give":5,"setblock":7,"summon":5,"testforblock":6}
var commandsSelectorIndexes = {"achievement":[3],"clear":[1],"effect":[1],"enchant":[1],"entitydata":[1],"execute":[1],"gamemode":[2],"give":[1],"kill":[1],"particle":[11],"playsound":[3],"spawnpoint":[1],"stopsound":[1],"teleport":[1],"tell":[1],"msg":[1],"w":[1],"tellraw":[1],"title":[1],"tp":[1,2],"xp":[2]}
var dataWalkers = {}
var datafixes = {}

function getExpectedType(type){
	if(type == "command" || type == "selector"){
		return ["string"];
	}else if(type == "json"){
		return ["string", "object"]
	}
	return ["object"];
}

function process(type, data){
	if(data == null){
		return data;
	}
	
	var dataType = typeof(data);
	if(dataType in getExpectedType(type)){	
		//This warn may triger on some correct syntax, like with the "Potion" tag.
		console.log("[WARN] Unexpected type found " + type + " for :");
		console.log(data);
		return data;
	}
	
	if(type == "selector"){
		if(data[0] != "@" || data.length <= 2){
			return data;
		}
	}
	
	if(type == "json"){
		var jsonObj;
		if(dataType == "string"){
			try{
				jsonObj = JSON.parse(data);	
			}catch(e){
				console.log("[WARN] Skipping invalid JSON : " + data);
				return data;
			}		
		}else{
			jsonObj = data;
		}
		if(jsonObj instanceof Array){
			for(var i = 0; i < jsonObj.length; i++){
				if(typeof(jsonObj[i]) == "object"){
					jsonObj[i] = process("json", jsonObj[i]);
				}
			}
		}else{		
			jsonObj = processFixes(type, jsonObj);
			jsonObj = processWalkers(type, jsonObj);
		}
		if(dataType == "string"){
			return JSON.stringify(jsonObj);
			//return rebuildJSON(jsonObj);
		}
		return jsonObj;
	}
	
	if(type == "command"){
		quoted = false;
		if(data.startsWith("\"")){
			data = cleanQuoteEscape(data);
			quoted = true;
		}
        data = data.trim();
		var slashed = data.startsWith("/");
		if(slashed){
			data = data.substring(1);
		}
		if(data.length == 0 || data.startsWith("#")){
			return (slashed ? "/" : "") + data;
		}
		
		var splited = data.split(" ");
		
		//TODO reduce that
		var nbtIndex = getCommandsNBTIndex(splited);
		var jsonIndex = getCommandJSONIndex(splited);
		if(nbtIndex != null){
			splited[nbtIndex] = joinStrArrayAt(splited, nbtIndex, " ");
			splited = splited.slice(0, nbtIndex+1);
		}else if(jsonIndex != null){
			splited[jsonIndex] = joinStrArrayAt(splited, jsonIndex, " ");
			splited = splited.slice(0, jsonIndex+1);
		}
		
		splited = processFixes(type, splited);
		splited = processWalkers(type, splited);
		
		return  (slashed ? "/" : "") + splited.join(" ");
	}	
	
	data = processFixes(type, data);
	data = processWalkers(type, data);
	return data;
}
function processFixes(type, data){
    var fixes = datafixes[type];
    if(fixes != null){
        for(var i in fixes){
			var fix = fixes[i];
            if(fix.getVersion() > cmdVersion){
                data = fix.fixData(data);
            }
        }
    }
    return data;
}
function processWalkers(type, data){
    var walkers = dataWalkers[type];
    if(walkers != null){
        for(var i in walkers){
            var walker = walkers[i];
			data = walker.walkData(data);
        }
	}
    return data;
}


function Fix(version, fix){
    this.getVersion = function(){return version;};
    this.fixData = fix;
}
function Walker(walk){
    this.walkData = walk;
}



function registerFix(type, version, fix){
    datafixes[type].push(new Fix(version, fix));
}
function registerWalker(type, walker){
    dataWalkers[type].push(new Walker(walker));
}



function joinStrArrayAt(ar, i, sep){
    var s = "";
    while(i < ar.length){
        s += ar[i] + sep;
		i++;
    }
    return s;
}

function getWalkerTypeFromCommand(cmd){
	return walkerTypeFromCommand[cmd[0]];
}

function getCommandsSelectorIndexes(cmd){
	if(cmd[0] == "replaceitem"){
		if(indexEquals(cmd, 1, "entity")){
			return [2];
		}
		return null;
	}else if(cmd[0] == "stats" ){
		if(indexEquals(cmd, 1, "block")){
			return [7];
		}else if(indexEquals(cmd, 1, "entity")){
			return [2, 5];
		}
		return null;
	}else if(cmd[0] == "scoreboard"){
		if(indexEquals(cmd, 1, "players")){
			if(indexEquals(cmd, 2, "operation")){
				return [3, 6];
			}
			return [3];
		}
	}
	return commandsSelectorIndexes[cmd[0]];
}

function getCommandsNBTIndex(cmd){
	if(cmd[0] == "replaceitem"){
		if(indexEquals(cmd, 1, "block")){
			return 9;
		}else if(indexEquals(cmd, 1, "entity")){
			return 7;
		}
		return null;
	}else if(cmd[0] == "scoreboard"){
		if(indexEquals(cmd, 1, "players") && (indexEquals(cmd, 2, "tag") || indexEquals(cmd, 2, "add") || indexEquals(cmd, 2, "remove") || indexEquals(cmd, 2, "remove"))){
				return 6;
		}
	}	
    return commandsNBTIndexes[cmd[0]];
}

function getCommandJSONIndex(cmd){
	if(cmd[0] == "tellraw"){
		return 2;
	}else if(cmd[0] == "title"){
		if(indexEquals(cmd, 1, "title") || indexEquals(cmd, 1, "subtitle") || indexEquals(cmd, 1, "actionbar")){
			return 3;	
		}
		return null;
	}
	return null;
}

function getItemIdIndex(cmd){
	if(cmd[0] == "give" || cmd[0] == "clear"){
		return 2;
	}else if(cmd[0] == "replaceitem"){
		if(indexEquals(cmd, 1, "entity")){
			return 4;
		}else if(indexEquals(cmd, 1, "block")){
			return 6;
		}else{
			console.log("Incomplete command " + cmd.join(" "));
			return -1;
		}
	}
}

function getItemDamageIndex(cmd){
	if(cmd[0] == "give"){
		return 4;
	}else if(cmd[0] == "clear"){
		return 3;
	}else if(cmd[0] == "replaceitem"){
		if(indexEquals(cmd, 1, "entity")){
			return 6;
		}else if(indexEquals(cmd, 1, "block")){
			return 8;
		}else{
			console.log("Incomplete command " + cmd.join(" "));
			return -1;
		}
	}
}

function getBlockIdIndex(cmd){	
	if(cmd[0] == "fill"){
		return 7;
	}else if(cmd[0] == "setblock"){
		return 4;
	}else if(cmd[0] == "testforblock"){
		return 4;
	}
	return null;
}


//TODO implement better way to request numbers
function getNum(num, isFloat, charTypes){	
	if(num == null){
		return null;
	}
	if(typeof(num) == "number"){
		return num;
	}
	for(var i = 0; i < charTypes.length; i++){
		if(num.endsWith(charTypes[i])){
			num.substring(0, num.length - 1);
			break;
		}
	}
	var parsed = isFloat ? parseFloat(num) : parseInt(num);
	return isNaN(parsed)  ? null : parsed;
}

function getByte(num){
	if(typeof(num) == "boolean"){
		return num ? 1 : 0;
	}
	
	if(num == "true") return 1;
	if(num == "false") return 0;
	
	return getNum(num, false, ["b", "B"]);
}

function getShort(num){	
	return getNum(num, false, ["s", "S"]);
}

function getInt(num){
	return getNum(num, false, []);
}

function getFloat(num){	
	return getNum(num, true, ["f", "F"]);
}

function getDouble(num){	
	return getNum(num, true, ["d", "D"]);
}


function getString(str){
	if(str == null){
		return null;
	}
	if(typeof(str) == "number"){
		return str.toString();
	}
	return removeQuoteStr(str);
}


function trimId(str){
	if(str == null) return null;
	var spl = str.split(":");
	return spl[spl.length - 1];

}

function indexEquals(ar, index, str){
	if(ar.length >= index){
		return ar[index] == str;
	}
	return false;
}


function isJSON(str){
	try{
		return typeof(JSON.parse(str)) == "object";
	}catch(e){
		return false;
	}
}

function isValid(str){
	try{
		validateStr(str);
	}catch(e){
		return false;
	}
	return true;
}

function escapeStr(str){
	return "\"" + str.split('\\').join('\\\\').split('"').join('\\\"') + "\"";
}

function unEscape(str){
    return str.split("\\\"").join("\"").split("\\\\").join("\\");
}

function removeQuoteStr(str){
    if(str.match("^\".*\"$") != null){
        return str.substring(1, str.length - 1);
    }
    return str;
}

function cleanQuoteEscape(str){
    if(str.match("^\".*\"$") != null){
        str = str.substring(1, str.length - 1);
    }
    return unEscape(str);
}

function rebuildJSON(data){
	if(data == null){
		return "";
	}
	var type = typeof(data);
	if(type == "number"){
		return "\"" + data.toString() + "\"";
	}else if(type == "string"){
		if(!data.startsWith("\"")){
			return escapeStr(data);
		}
		return data;
	}else if(data instanceof Array){
		var elems = [];
		for(var i in data){
			elems.push(rebuildJSON(data[i]));
		}
		return "[" + elems.join(",") + "]";
	}else if(type == "object"){
		var elems = [];
		for(var k in data){
			elems.push( "\"" + removeQuoteStr(k) + "\":" + rebuildJSON(data[k]));
		}
		return "{" + elems.join(",") + "}";
	}else{
		console.log("unknown type : " + type + " " + data);
	}
}

function uuidConvert(name) {
        var components = name.split("-");
        if (components.length != 5){
			return null;
		}
		for(var i = 0; i < 5; i++){
			components[i] = parseInt("0x" + components[i]);
		}
		var mostSigBits = new BigNumber(components[0]).multiply(65536).add(components[1]).multiply(65536).add(components[2]).toString();
        var leastSigBits = new BigNumber(components[3]).multiply(281474976710656).add(components[4]).toString();
		return {"most":mostSigBits + "L", "least":leastSigBits + "L"};
    }


function fixJSON(data){
	if(typeof(data) == "object"){
		data = rebuildJSON(data);
	}else{
		if(data.startsWith("\"")){
			data = cleanQuoteEscape(data);
		}
		try{
			//valid JSON test
			JSON.parse(data);
		}catch(e){
			try{
				//lenient JSON test
				var obj = toObject(data);
				data = rebuildJSON(obj);
				//TODO implements rebuildJSON(obj);
			}catch(f){
				//raw text
				data = "[\"" + data + "\"]";
			}
		}
	}
	return data;
}

var cmdDefaultValue = {"clear":{3:"0",4:"-1",5:"{}"},"give":{3:"1",4:"0",5:"{}"}}
var replaceitemDefaultValue = {5:"1",6:"0",7:"{}"};
function getDefaultCmdValue(cmd, size){
	if(cmd[0] == "replaceitem"){
		var delta = 2;
		if(indexEquals(cmd, 1, "entity")){
			delta = 0;
		}else if(!indexEquals(cmd, 1, "block")){
			return null;
		}
		return replaceitemDefaultValue[size - delta];
	}
	var cmdDefault = cmdDefaultValue[cmd[0]];
	return cmdDefault == null ? null : cmdDefault[size];
}

function completeDefaultArgs(cmd, size){
	var cmdSize = cmd.length;
	while(cmdSize <= size){
		var next = getDefaultCmdValue(cmd, cmdSize);
		if(next != null){
			cmd.push(next);
		}else{
			console.log("[ERROR] Imcomplete command : " + cmd.join(" "));
			cmd.push("???");
		}
		cmdSize++;
	}
}
