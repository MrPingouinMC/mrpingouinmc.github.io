function walkElem(data, type, tag){
	var elem = data[tag];
	if(elem != null){
		data[tag] = process(type, elem);
	}
	return data;
}

function walkElemList(data, type, tag){
	var elems = data[tag];
	if(elems != null){
		for(var i = 0; i < elems.length; i++){
			elems[i] = process(type, elems[i]);
			
		}
		data[tag] = elems;
	}
	return data;
}

function itemToBlockWalker(data){
    var tag = data["tag"];
	if(tag != null){
		data["tag"] = walkElem(tag, "block", "BlockEntityTag");
	}
	return data;
}

function itemToJsonWalker(data){
	var tag = data["tag"];
	if(tag != null){
		var pages = tag["pages"];
		if(pages != null){
			for(var i = 0; i < pages.length; i++){
				pages[i] = escapeStr(process("json", cleanQuoteEscape(pages[i])));
			}
			tag["pages"] = pages;
		}
		data["tag"] = tag;
	}	
	return data;
}

function itemToEntityWalker(data){
    var tag = data["tag"];
	if(tag != null){
		data["tag"] = walkElem(tag, "entity", "EntityTag");
	}
	return data;
}


function blockToItemWalker(data){
	data = walkElem(data, "item", "Item");
	data = walkElemList(data, "item", "Items");
	return data;
}

function blockToEntityWalker(data){
	data = walkElem(data, "entity", "SpawnData");
	
	var spawnPotetials = data["SpawnPotentials"];
	if(spawnPotetials != null){
		for(var i = 0; i < spawnPotetials.length; i++){
			var properties = spawnPotetials[i]["Properties"];
			if(properties != null){
				properties = process("entity", properties);
				spawnPotetials[i]["Properties"] = properties;
			}
		}
		data["SpawnPotentials"] = spawnPotetials
	}
	return data;
}

function blockToJSONWalker(data){
	for(var i = 1; i < 5; i++){
		var text = data["Text" + i];
		if(text != null){
			console.log(text);
			data["Text" + i] = escapeStr(process("json", cleanQuoteEscape(text)));
		}
	}
	return data;
}

function entityToEntityWalker(data){
	if(cmdVersion <= 135){
		data = walkElem(data, "entity", "Riding");
	}
	data = walkElemList(data, "entity", "Passengers");
	
	var rootVehicle = data["RootVehicle"];
	if(rootVehicle != null){
		rootVehicle = walkElem(rootVehicle, "entity", "Entity");
		data["RootVehicle"] = rootVehicle;
	}
	
	return data;
}

function entityToItemWalker(data){
	if(cmdVersion <= 100){
		data = walkElemList(data, "item", "Equipment");
	}
	//mobs generics walkers
	data = walkElemList(data, "item", "HandItems");
	data = walkElemList(data, "item", "ArmorItems");
	data = walkElemList(data, "item", "ArmorItem");
	data = walkElemList(data, "item", "Items");
	data = walkElemList(data, "item", "Inventory");
	data = walkElem(data, "item", "SaddleItem");
	
	//Other entity walker
	data = walkElem(data, "item", "Potion");
	data = walkElem(data, "item", "Item");
	
	//Player walkers
	data = walkElem(data, "item", "SelectedItem");
	data = walkElemList(data, "item", "EnderItems");
	
	var offers = data["Offers"];
	if(offers != null){
		var recipes = data["Recipes"];
		if(recipes != null){
			for(var i = 0; i < recipes.length; i++){
			recipes[i] = walkElem(recipes[i], "item", "buy");
			recipes[i] = walkElem(recipes[i], "item", "buyB");
			recipes[i] = walkElem(recipes[i], "item", "sell");
			}
			data["Recipes"] = recipes;
		}
		data["Offers"] = offers;
	}
	
	return data;
}

function entityToBlockWalker(data){
	data = walkElem(data, "block", "TileEntityData");
	return data;
}


function commandTagWalker(data){
	var elem = data["Command"];
	if(elem != null){
		data["Command"] = process("command", cleanQuoteEscape(elem));
	}
	
	
	return data;
}

function commandWalker(data){
    //selector walker
	var selectorIndexes = getCommandsSelectorIndexes(data);
    if(selectorIndexes != null){
		for(var i in selectorIndexes){
			var index = selectorIndexes[i];
			if(index < data.length){
				data[index] = process("selector", data[index]);
			}
		}
    }

	//NBT walker
	var nbtIndex = getCommandsNBTIndex(data);
    if(nbtIndex != null && nbtIndex < data.length){
        var obj = toObject(data[nbtIndex]);
		if(obj == null){
			if(data[0] != "fill"){
				console.log("[WARN]Expected nbt entry at index " + nbtIndex + " got :");
				console.log(data[nbtIndex]);
			}
			return data;
		}
		if(data[0] == "give" || data[0] == "clear"){
			obj = process(getWalkerTypeFromCommand(data), {tag:obj}).tag;
		}else{
			obj = process(getWalkerTypeFromCommand(data), obj);
		}
        
        var outSplitted = data.slice(0, nbtIndex);
        outSplitted[nbtIndex] = rebuild(obj);
        return outSplitted;
    }
    return data;
}

function commandJSONWalker(data){
	if(data[0] == "tellraw" || data[0] == "title"){
		var jsonIndex = getCommandJSONIndex(data);
		data[jsonIndex] = process("json", data[jsonIndex]);
	}
	return data;
}

function commandExecuteWalker(data){
    if(data[0] == "execute"){
        var splitIndex  = indexEquals(data, 5, "detect") ? 11 : 5;
		if(data.length >= splitIndex){
			var outCmd = data.slice(0, splitIndex);
			outCmd[splitIndex] = process("command", data[splitIndex]);
			return outCmd;
		}
    }
	return data;
}

function commandSelectorExtraWalker(data){
	var i = -1;
	if(data[0] == "spreadplayer"){
        i = 6;		
    }else if(data[0] == "tell" || data[0] == "msg" || data[0] == "w" || data[0] == "say"){
		i = 2;
	}else if(data[0] == "say"){
		i = 1;
	}else if(data[0] == "scoreboard " && indexEquals(data, 1, "teams")){
		i = 4;
	}else{
		return data;
	}
	
	while(i < data.length){
		data[i] = process("selector", data[i]);
		i++;
	}
	return data;
}

function commandStatToSelectorWalker(data){
	var stats = data["CommandStats"];
	if(stats != null){
		stats = walkElem(stats, "selector", "SuccessCountName");
		stats = walkElem(stats, "selector", "AffectedBlocksName");
		stats = walkElem(stats, "selector", "AffectedEntitiesName");
		stats = walkElem(stats, "selector", "AffectedItemsName");
		stats = walkElem(stats, "selector", "QueryResultName");
		data["CommandStats"] = stats;
	}
	return data;	
}

function jsonWalker(data){
	var extra = data["extra"];
	if(extra != null){
		data["extra"] = process("json", extra);
	}
	return data;
}

function jsonToCommandWalker(data){
	var clickEvent = data["clickEvent"];
	if(clickEvent != null){
		if(clickEvent["action"] != null && clickEvent["action"] == "run_command" && clickEvent["value"] != null){
			clickEvent["value"] = process("command", clickEvent["value"]);
		}
		data["clickEvent"] = clickEvent; 
	}
	var hoverEvent = data["hoverEvent"];
	if(hoverEvent != null){
		var val = hoverEvent["value"];
		if(val != null){
			var action = hoverEvent["action"];
			if(action == "show_text"){
				hoverEvent["value"] = process("json", val);
			}else if(action == "show_item"){
				hoverEvent["value"] = rebuild(process("item", toObject(val)));
			}else if(action == "show_entity"){
				hoverEvent["value"] = rebuild(process("entity", toObject(val)))
			}
		}
		data["hoverEvent"] = hoverEvent;
	}
	
	return data;
}

function jsonToSelectorWalker(data){
	var score = data["score"];
	if(score != null){
		var name = score["name"];
		if(name != null){
			console.log("walk selector " + name);
			name = process("selector", name);
			score["name"] = name;
		}
		data["score"] = score;
	}
	data = walkElem(data, "selector", "selector");
	return data;
}



function registerWalkers(){
    
	registerWalker("item", itemToBlockWalker);
	registerWalker("item", itemToJsonWalker);
	registerWalker("item", itemToEntityWalker);
	
	
	registerWalker("block", blockToItemWalker);
	registerWalker("block", blockToEntityWalker);
	registerWalker("block", blockToJSONWalker);
	registerWalker("block", commandTagWalker);
	registerWalker("block", commandStatToSelectorWalker);
	
    registerWalker("command", commandWalker);
    registerWalker("command", commandExecuteWalker);
    registerWalker("command", commandSelectorExtraWalker);
	registerWalker("command", commandJSONWalker);
	
	registerWalker("entity", entityToEntityWalker);
	registerWalker("entity", commandTagWalker);
	registerWalker("entity", commandStatToSelectorWalker);
	registerWalker("entity", entityToItemWalker);
	registerWalker("entity", entityToBlockWalker);
	
	registerWalker("json", jsonWalker);
	registerWalker("json", jsonToCommandWalker);
	registerWalker("json", jsonToSelectorWalker);
}