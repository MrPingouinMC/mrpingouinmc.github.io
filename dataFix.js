
function fixSelectorType(data){
	return data.replace("MinecartCommandBlock", "commandblock_minecart").replace("test", "te_st");
}

var idRepalceList = {"areaeffectcloud":"area_effect_cloud","armorstand":"armor_stand","cavespider":"cave_spider","minecartcommandblock":"commandblock_minecart","dragonfireball":"dragon_fireball","thrownegg":"egg","endercrystal":"ender_crystal","enderdragon":"ender_dragon","thrownenderpearl":"ender_pearl","eyeofendersignal":"eye_of_ender_signal","fallingsand":"falling_block","fireworksrocketentity":"fireworks_rocket","minecartfurnace":"furnace_minecart","minecarthopper":"hopper_minecart","entityhorse":"horse","itemframe":"item_frame","leashknot":"leash_knot","lightningbolt":"lightning_bolt","lavaslime":"magma_cube","minecartrideable":"minecart","mushroomcow":"mooshroom","ozelot":"ocelot","polarbear":"polar_bear","shulkerbullet":"shulker_bullet","smallfireball":"small_fireball","spectralarrow":"spectral_arrow","thrownpotion":"potion","minecartspawner":"spawner_minecart","primedtnt":"tnt","minecarttnt":"tnt_minecart","villagergolem":"villager_golem","witherboss":"wither","witherskull":"wither_skull","thrownexpbottle":"xp_bottle","pigzombie":"zombie_pigman"}

function entityIdFix(entity){
	var id = entity["id"];
	if(id != null){
		var idCompare = id.toLowerCase();
		for(var k in idRepalceList){
			if(idCompare == k){
				id = idRepalceList[k];
				break;
			}
		}
		entity["id"] = id;
	}
	return entity;
}

function commandIdFix(cmd){
	if(cmd[0] == "summon"){
		var id = cmd[1];
		var idCompare = id.toLowerCase();
		for(var k in idRepalceList){
			if(idCompare == k){
				id = idRepalceList[k];
				break;
			}
		}
		cmd[1] = id;
	}
	return cmd;
}



function testFix(data){
	var t = data["test"];
	if(t != null){
		data["test"] = "1"
	}
	return data;
}

function testItemFix(data){
	var tag = data["tag"];
	if(tag != null){
		var t = tag["test"];
		if(t != null){
			tag["test"] = "1";
		}
		data["tag"] = tag;
	}
	return data;
}

/*
	
	Above ones are means for tests, they will be corrected / removed	
	
*/



function entityArmorAndHeldFix(entity){
	//TODO make this thing consistent.
	equips = entity["Equipment"];
	if(equips != null){
		if(equips.length > 0 && entity["HandItems"] == null){
			entity["HandItems"] = [equips[0]];
		}
		if(equips.length > 1 && entity["ArmorItem"] == null){
			var armorItems = [];
			for(var i = 1; i < Math.min(5, equips.length); i++){
				armorItems.push(equips[i]);
			}
			entity["ArmorItem"] = armorItems;
		}
		delete entity["Equipment"];
	}
	
	dchance = entity["DropChances"];
	if(dchance != null){
		if(dchance.length > 0 && entity["HandDropChances"] == null){
			entity["HandDropChances"] = [dchance[0]];
		}
		if(dchance.length > 1 && entity["ArmorDropChances"] == null){
			var armorChance = [];
			for(var i = 1; i < Math.min(5, dchance.length); i++){
				armorChance.push(dchance[i]);
			}
			entity["ArmorDropChances"] = armorChance;
		}
		delete entity["DropChances"];
	}
	
	return entity;
}

function strictJSONSignFix(block){
	for(var i = 1; i < 5; i++){
		var text = block["Text" + i];
		if(text != null){
			block["Text" + i] = escapeStr(fixJSON(text));
		}
	}
	return block;
}

function strictJSONCommandFix(cmd){
	if(getWalkerTypeFromCommand(cmd) == "json"){
		var jsonIndex = cmd[0] == "tellraw" ? 2 : 3;
		if(cmd.length > jsonIndex){
			var json = cmd[jsonIndex];
			if(!isJSON(json)){
				cmd[jsonIndex] = fixJSON(json);
			}
		}
	}
	return cmd;
}

/*
function missingTextFix(cmd){
	if(getWalkerTypeFromCommand(cmd) == "block"){
		var blockIdIndex = getBlockIdIndex(cmd);
		if(blockIdIndex < cmd.length){
			var id = trimId(cmd[blockIdIndex]);
			if(id == "standing_sign" || id == "wall_sign"){
			}
		}
	}
	return cmd;
}
*/
	
	
function strictJSONItemFix(item){
	var tag = item["tag"];
	if(tag != null){
		var pages = tag["pages"];
		if(pages != null){
			for(var i = 0; i < pages.length; i++){ 
				pages[i] = escapeStr(fixJSON(pages[i]));
			}
			tag["pages"] = pages;
		}
		item["tag"] = tag;
	}
	return item;
}


//Some ids are missing because post Dataversion:102 items should not be in this list.
itemNumIdList = {1:"stone",2:"grass",3:"dirt",4:"cobblestone",5:"planks",6:"sapling",7:"bedrock",8:"flowing_water",9:"water",10:"flowing_lava",11:"lava",12:"sand",13:"gravel",14:"gold_ore",15:"iron_ore",16:"coal_ore",17:"log",18:"leaves",19:"sponge",20:"glass",21:"lapis_ore",22:"lapis_block",23:"dispenser",24:"sandstone",25:"noteblock",27:"golden_rail",28:"detector_rail",29:"sticky_piston",30:"web",31:"tallgrass",32:"deadbush",33:"piston",35:"wool",37:"yellow_flower",38:"red_flower",39:"brown_mushroom",40:"red_mushroom",41:"gold_block",42:"iron_block",43:"double_stone_slab",44:"stone_slab",45:"brick_block",46:"tnt",47:"bookshelf",48:"mossy_cobblestone",49:"obsidian",50:"torch",51:"fire",52:"mob_spawner",53:"oak_stairs",54:"chest",56:"diamond_ore",57:"diamond_block",58:"crafting_table",60:"farmland",61:"furnace",62:"lit_furnace",65:"ladder",66:"rail",67:"stone_stairs",69:"lever",70:"stone_pressure_plate",72:"wooden_pressure_plate",73:"redstone_ore",76:"redstone_torch",77:"stone_button",78:"snow_layer",79:"ice",80:"snow",81:"cactus",82:"clay",84:"jukebox",85:"fence",86:"pumpkin",87:"netherrack",88:"soul_sand",89:"glowstone",90:"portal",91:"lit_pumpkin",95:"stained_glass",96:"trapdoor",97:"monster_egg",98:"stonebrick",99:"brown_mushroom_block",100:"red_mushroom_block",101:"iron_bars",102:"glass_pane",103:"melon_block",106:"vine",107:"fence_gate",108:"brick_stairs",109:"stone_brick_stairs",110:"mycelium",111:"waterlily",112:"nether_brick",113:"nether_brick_fence",114:"nether_brick_stairs",116:"enchanting_table",119:"end_portal",120:"end_portal_frame",121:"end_stone",122:"dragon_egg",123:"redstone_lamp",125:"double_wooden_slab",126:"wooden_slab",127:"cocoa",128:"sandstone_stairs",129:"emerald_ore",130:"ender_chest",131:"tripwire_hook",133:"emerald_block",134:"spruce_stairs",135:"birch_stairs",136:"jungle_stairs",137:"command_block",138:"beacon",139:"cobblestone_wall",141:"carrots",142:"potatoes",143:"wooden_button",145:"anvil",146:"trapped_chest",147:"light_weighted_pressure_plate",148:"heavy_weighted_pressure_plate",151:"daylight_detector",152:"redstone_block",153:"quartz_ore",154:"hopper",155:"quartz_block",156:"quartz_stairs",157:"activator_rail",158:"dropper",159:"stained_hardened_clay",160:"stained_glass_pane",161:"leaves2",162:"log2",163:"acacia_stairs",164:"dark_oak_stairs",170:"hay_block",171:"carpet",172:"hardened_clay",173:"coal_block",174:"packed_ice",175:"double_plant",256:"iron_shovel",257:"iron_pickaxe",258:"iron_axe",259:"flint_and_steel",260:"apple",261:"bow",262:"arrow",263:"coal",264:"diamond",265:"iron_ingot",266:"gold_ingot",267:"iron_sword",268:"wooden_sword",269:"wooden_shovel",270:"wooden_pickaxe",271:"wooden_axe",272:"stone_sword",273:"stone_shovel",274:"stone_pickaxe",275:"stone_axe",276:"diamond_sword",277:"diamond_shovel",278:"diamond_pickaxe",279:"diamond_axe",280:"stick",281:"bowl",282:"mushroom_stew",283:"golden_sword",284:"golden_shovel",285:"golden_pickaxe",286:"golden_axe",287:"string",288:"feather",289:"gunpowder",290:"wooden_hoe",291:"stone_hoe",292:"iron_hoe",293:"diamond_hoe",294:"golden_hoe",295:"wheat_seeds",296:"wheat",297:"bread",298:"leather_helmet",299:"leather_chestplate",300:"leather_leggings",301:"leather_boots",302:"chainmail_helmet",303:"chainmail_chestplate",304:"chainmail_leggings",305:"chainmail_boots",306:"iron_helmet",307:"iron_chestplate",308:"iron_leggings",309:"iron_boots",310:"diamond_helmet",311:"diamond_chestplate",312:"diamond_leggings",313:"diamond_boots",314:"golden_helmet",315:"golden_chestplate",316:"golden_leggings",317:"golden_boots",318:"flint",319:"porkchop",320:"cooked_porkchop",321:"painting",322:"golden_apple",323:"sign",324:"wooden_door",325:"bucket",326:"water_bucket",327:"lava_bucket",328:"minecart",329:"saddle",330:"iron_door",331:"redstone",332:"snowball",333:"boat",334:"leather",335:"milk_bucket",336:"brick",337:"clay_ball",338:"reeds",339:"paper",340:"book",341:"slime_ball",342:"chest_minecart",343:"furnace_minecart",344:"egg",345:"compass",346:"fishing_rod",347:"clock",348:"glowstone_dust",349:"fish",350:"cooked_fished",351:"dye",352:"bone",353:"sugar",354:"cake",355:"bed",356:"repeater",357:"cookie",358:"filled_map",359:"shears",360:"melon",361:"pumpkin_seeds",362:"melon_seeds",363:"beef",364:"cooked_beef",365:"chicken",366:"cooked_chicken",367:"rotten_flesh",368:"ender_pearl",369:"blaze_rod",370:"ghast_tear",371:"gold_nugget",372:"nether_wart",373:"potion",374:"glass_bottle",375:"spider_eye",376:"fermented_spider_eye",377:"blaze_powder",378:"magma_cream",379:"brewing_stand",380:"cauldron",381:"ender_eye",382:"speckled_melon",383:"spawn_egg",384:"experience_bottle",385:"fire_charge",386:"writable_book",387:"written_book",388:"emerald",389:"item_frame",390:"flower_pot",391:"carrot",392:"potato",393:"baked_potato",394:"poisonous_potato",395:"map",396:"golden_carrot",397:"skull",398:"carrot_on_a_stick",399:"nether_star",400:"pumpkin_pie",401:"fireworks",402:"firework_charge",403:"enchanted_book",404:"comparator",405:"netherbrick",406:"quartz",407:"tnt_minecart",408:"hopper_minecart",417:"iron_horse_armor",418:"golden_horse_armor",419:"diamond_horse_armor",420:"lead",421:"name_tag",422:"command_block_minecart",2256:"record_13",2257:"record_cat",2258:"record_blocks",2259:"record_chirp",2260:"record_far",2261:"record_mall",2262:"record_mellohi",2263:"record_stal",2264:"record_strad",2265:"record_ward",2266:"record_11",2267:"record_wait"}

function itemNumIdFix(item){
	var idTag = getShort(item["id"]);
	if(idTag != null){
		if(idTag in itemNumIdList){
			item["id"] = "minecraft:" + itemNumIdList[idTag]; //TODO check if minecraft: is necessary
		}else{
			console.log("[WARN] Unable to fix item id : " + idTag);
		}
	}
	return item;	
}

function commandNumIdFix(cmd){
	if(cmd[0] == "clear" || cmd[0] == "give"){
		var itemIdIndex = 2;
		if(cmd.length > itemIdIndex){
			var id = getInt(cmd[itemIdIndex]);
			if(id != null){
				if(id in itemNumIdList){
					cmd[itemIdIndex] = itemNumIdList[id]; //TODO check if minecraft: is necessary (add option to add/remove this one)
				}else{
					console.log("[ERROR] Unable to fix item id : " + id);
				}
			}
		}
	}
	return cmd;
}

/*
	
	/give @p potion 1 x {}
	
	Items:[{id:potion,Damage:x,tag:{}}]
	
*/

potionIdList = {0:"water",1:"regeneration",2:"swiftness",3:"fire_resistance",4:"poison",5:"healing",6:"night_vision",8:"weakness",9:"strength",10:"slowness",11:"leaping",12:"harming",13:"water_breathing",14:"invisibility",16:"awkward",17:"regeneration",18:"swiftness",19:"fire_resistance",20:"poison",21:"healing",22:"night_vision",24:"weakness",25:"strength",26:"slowness",27:"leaping",28:"harming",29:"water_breathing",30:"invisibility",32:"thick",33:"strong_regeneration",34:"strong_swiftness",35:"fire_resistance",36:"strong_poison",37:"strong_healing",38:"night_vision",40:"weakness",41:"strong_strength",42:"slowness",43:"strong_leaping",44:"strong_harming",45:"water_breathing",46:"invisibility",49:"strong_regeneration",50:"strong_swiftness",51:"fire_resistance",52:"strong_poison",53:"strong_healing",54:"night_vision",56:"weakness",57:"strong_strength",58:"slowness",59:"strong_leaping",60:"strong_harming",61:"water_breathing",62:"invisibility",64:"mundane",65:"long_regeneration",66:"long_swiftness",67:"long_fire_resistance",68:"long_poison",69:"healing",70:"long_night_vision",72:"long_weakness",73:"long_strength",74:"long_slowness",75:"long_leaping",76:"harming",77:"long_water_breathing",78:"long_invisibility",80:"awkward",81:"long_regeneration",82:"long_swiftness",83:"long_fire_resistance",84:"long_poison",85:"healing",86:"long_night_vision",88:"long_weakness",89:"long_strength",90:"long_slowness",91:"long_leaping",92:"harming",93:"long_water_breathing",94:"long_invisibility",96:"thick",97:"regeneration",98:"swiftness",99:"long_fire_resistance",100:"poison",101:"strong_healing",102:"long_night_vision",104:"long_weakness",105:"strength",106:"long_slowness",107:"leaping",108:"strong_harming",109:"long_water_breathing",110:"long_invisibility",113:"regeneration",114:"swiftness",115:"long_fire_resistance",116:"poison",117:"strong_healing",118:"long_night_vision",120:"long_weakness",121:"strength",122:"long_slowness",123:"leaping",124:"strong_harming",125:"long_water_breathing",126:"long_invisibility"}
function itemPotionDamageFix(item){
	var id = trimId(getString(item["id"]));
	if(id == "potion"){
		console.log("fixing potion");
		var tag = item["tag"] == null ? {} : item["tag"];
		if(tag["Potion"] == null){
			var damage = getShort(item["Damage"]);
			if(damage == null){
				damage = 0;
			}			
			var pId = potionIdList[damage & 127];
			if(pId != null){
				tag["Potion"] = "minecraft:" + pId; //Check if minecraft: is necessary
			}else{
				tag["Potion"] = "minecraft:water";
				console.log("[WARN] Cannot find potion id : " + (damage & 127) + ". Using the default one minecraft:water");
			}
			if((damage & 16384) == 16384){
				item["id"] = "minecraft:splash_potion";
			}
			item["tag"] = tag;
			delete item["Damage"]; //Maybe keep this tag some times
		}
	}
	return item;
}


function commandPotionDamageFix(cmd){
	if(getWalkerTypeFromCommand(cmd) == "item"){
		var idIndex = getItemIdIndex(cmd);	
		if(indexEquals(cmd, idIndex, "potion") || indexEquals(cmd, idIndex, "minecraft:potion")){
			var dmgIndex = getItemDamageIndex(cmd);
			var damage = cmd[dmgIndex];
			if(cmd.length > dmgIndex && damage > 0){
				var nbtIndex = getCommandsNBTIndex(cmd);
				
				completeDefaultArgs(cmd, nbtIndex);

				var tag = toObject(cmd[nbtIndex]);
				var pId = potionIdList[damage & 127];
				if(pId != null){
					tag["Potion"] = "minecraft:" + pId; //Check if minecraft: is necessary
				}else{
					tag["Potion"] = "minecraft:water";
					console.log("[WARN] Cannot find potion id : " + (damage & 127) + ". Using the default one minecraft:water");
				}
				cmd[nbtIndex] = rebuild(tag);
				if((damage & 16384) == 16384){
					cmd[idIndex] = "minecraft:splash_potion";
				}
				cmd[dmgIndex] = "0";
			}
		}
		
	}
	return cmd;
}

var entityIdList = {1:"Item",2:"XPOrb",7:"ThrownEgg",8:"LeashKnot",9:"Painting",10:"Arrow",11:"Snowball",12:"Fireball",13:"SmallFireball",14:"ThrownEnderpearl",15:"EyeOfEnderSignal",16:"ThrownPotion",17:"ThrownExpBottle",18:"ItemFrame",19:"WitherSkull",20:"PrimedTnt",21:"FallingSand",22:"FireworksRocketEntity",23:"TippedArrow",24:"SpectralArrow",25:"ShulkerBullet",26:"DragonFireball",30:"ArmorStand",41:"Boat",42:"MinecartRideable",43:"MinecartChest",44:"MinecartFurnace",45:"MinecartTNT",46:"MinecartHopper",47:"MinecartSpawner",40:"MinecartCommandBlock",48:"Mob",49:"Monster",50:"Creeper",51:"Skeleton",52:"Spider",53:"Giant",54:"Zombie",55:"Slime",56:"Ghast",57:"PigZombie",58:"Enderman",59:"CaveSpider",60:"Silverfish",61:"Blaze",62:"LavaSlime",63:"EnderDragon",64:"WitherBoss",65:"Bat",66:"Witch",67:"Endermite",68:"Guardian",69:"Shulker",90:"Pig",91:"Sheep",92:"Cow",93:"Chicken",94:"Squid",95:"Wolf",96:"MushroomCow",97:"SnowMan",98:"Ozelot",99:"VillagerGolem",100:"EntityHorse",101:"Rabbit",120:"Villager",200:"EnderCrystal"}

function itemSpawnEggFix(item){
	var id = getString(item["id"]);
	if(id == "minecraft:spawn_egg" ||  id == "spawn_egg"){
		var tag = item["tag"] == null ? {} : item["tag"];
		var damage = getShort(item["Damage"]);
		if(damage == null){
			damage = 0;
		}			
		var entityId = entityIdList[damage];
		var entityTag = tag["EntityTag"] == null ? {} : tag["EntityTag"];
		if(entityId != null){
			entityTag["id"] = "minecraft:" + entityId; //TODO Check if minecraft: is necessary
		}else{
			console.log("[Error] Cannot fix entity id : " + damage);
		}
		tag["EntityTag"] = entityTag;
		item["tag"] = tag;
		delete item["Damage"]; //TODO Maybe add an option to keep this tag some times		
	}
	
	
	return item;
}

function commandSpawnEggFix(cmd){
	if(getWalkerTypeFromCommand(cmd) == "item"){
		var idIndex = getItemIdIndex(cmd);
		if(indexEquals(cmd, idIndex, "spawn_egg") || indexEquals(cmd, idIndex, "minecraft:spawn_egg")){
			var dmgIndex = getItemDamageIndex(cmd);
			var damage = cmd[dmgIndex];
			if(cmd.length > dmgIndex && damage > 0){
				var nbtIndex = getCommandsNBTIndex(cmd);
				
				completeDefaultArgs(cmd, nbtIndex);
				
				var tag = toObject(cmd[nbtIndex]);
				var entityId = entityIdList[damage];
				var entityTag = tag["EntityTag"] == null ? {} : tag["EntityTag"];//Even if EntityTag is not supposed to exist
				if(entityId != null){
					entityTag["id"] = "minecraft:" + entityId; //Check if minecraft: is necessary
				}else{
					console.log("[Error] Cannot fix entity id : " + damage);
				}
				tag["EntityTag"] = entityTag;
				cmd[nbtIndex] = rebuild(tag);
				cmd[dmgIndex] = "0";
			}
		}
		
	}
	return cmd;
}

var minecraftTypeList = {0:"MinecartRideable",1:"MinecartChest",2:"MinecartFurnace",3:"MinecartTNT",4:"MinecartSpawner",5:"MinecartHopper",6:"MinecartCommandBlock"}

function entityMinecartTypeFix(entity){
	var id = getString(entity["id"]);
	if(id == "Minecart"){
		var type = getInt(entity["Type"]);
		if(!(type in minecraftTypeList)){
			type = 0;
		}
		entity["id"] = minecraftTypeList[type];
		delete entity["Type"];
	}
	return entity;
}

function commandMinecartTypeFix(cmd){
	
	//TODO try to fix according to the selector
	return cmd;
}


function fixSpawner(block){
	var entityId = getString(block["EntityId"]);
	if(entityId != null){
		var spawnData = block["SpawnData"] == null ? {} : block["SpawnData"];
		spawnData["id"] = entityId.trim().length == 0 ? "Pig" : entityId;
		block["SpawnData"] = spawnData;
		delete block["EntityId"];
	}
	var spawnPotentials = block["SpawnPotentials"];
	if(spawnPotentials != null){
		for(var i = 0; i < spawnPotentials.length; i++){
			var type = spawnPotentials[i]["Type"];
			if(type != null){
				spawnPotentials[i]["id"] = type;
				delete spawnPotentials[i]["Type"];
			}
			var prop = spawnPotentials[i]["Properties"];
			if(prop != null){
				spawnPotentials[i]["Entity"] = prop;
				delete spawnPotentials[i]["Properties"];
			}
		}
		block["SpawnPotentials"] = spawnPotentials;
	}
	return block;
}

function spawnerEntityIdFix(block){
	var id = block["id"];
	if(id == "MobSpawner"){
		block = fixSpawner(block);
	}	
	return block;
}

function commandSpawnerEntityIdFix(cmd){
	if(getWalkerTypeFromCommand(cmd) == "block"){
		var idIndex = getBlockIdIndex(cmd);
		if(indexEquals(cmd, idIndex, "mob_spawner") || indexEquals(cmd, idIndex, "minecraft:mob_spawner")){
			var nbtIndex = getCommandsNBTIndex(cmd);
			if(nbtIndex < cmd.length){
				var nbt = toObject(cmd[nbtIndex]);	
				nbt = fixSpawner(nbt);
				cmd[nbtIndex] = rebuild(nbt);
			}
		}
	}
	return cmd;
}

function entityUUIDFix(entity){
	var uuid = getString(entity["UUID"])//TODO fix quote on a global scale;
	if(uuid != null){
		var uuidLong = uuidConvert(uuid);
		console.log(uuidLong);
		console.log(uuid);
		entity["UUIDMost"] = uuidLong.most;
		entity["UUIDLeast"] = uuidLong.least;
		delete entity["UUID"];
	}
	return entity;
}

function entityHealthFix(entity){
	var healthF = getFloat(entity["HealF"]);
	var health = getShort(entity["Health"]);
	var healFloat = null;
	if(healthF != null){
		healFloat = healthF;
		delete entity["HealF"]
	}
	if(health != null){
		healFloat = health;
	}
	if(healFloat != null){
		entity["Health"] = healFloat; // TODO add "f" ?
	}
	return entity;
}

function horseSaddleFix(entity){
	var saddle = getByte(entity["Saddle"]);
	if(saddle != null){
		saddleItem = {};
		saddleItem["id"] = "minecraft:saddle";
		saddleItem["Count"] = "1b";
		saddleItem["Damage"] = "0s";
		entity["SaddleItem"] = saddleItem;
		delete entity["Saddle"];
	}
	return entity;
}

//TODO 
function itemFrameDirectionFix(entity){
	var dir = getByte(entity["Dir"]);
	var direction = getByte(entity["Direction"]);
	var facing = null;
	if(dir != null){
		facing = null; //TODO calculate new Facing
		delete entity["Dir"];
		
	}
	if(direction != null){
		facing = null; //TODO calculate new Facing
		
		var tileX = getInt(entity["TileX"]);
		var tileY = getInt(entity["TileY"]);
		var tileZ = getInt(entity["TileZ"]);
		
		if(tileX != null) entity["TileX"] = tileX + 0;//TODO get offset X
		if(tileY != null) entity["TileY"] = tileX + 0;//TODO get offset Y
		if(tileZ != null) entity["TileZ"] = tileX + 0;//TODO get offset Z
		
		
		var rotation = getByte(entity["ItemRotation"]);
		if(rotation != null){
			entity["ItemRotation"] = (rotation * 2) + "b";//TODO add option to force ItemRotation if even if there is no Direction tag.
		}
		
		delete entity["Direction"];
		
	}
	if(facing != null){
		entity["Facing"] = facing;
	}
	return entity;
}

function redundantDropChanceFix(entity){
	
	return entity;
}



function registerDataFixes(){
    registerFix("entity", 100, entityArmorAndHeldFix);//TODO fix that?
	
    registerFix("block", 101, strictJSONSignFix);
    registerFix("command", 101, strictJSONCommandFix);
	//registerFix("command", 101, missingTextFix);
	registerFix("item", 165, strictJSONItemFix);
	/*
		TODO add mising Text tag to :
			- place block command
			- to block walker
	*/
	
    registerFix("item", 102, itemNumIdFix);
	registerFix("command", 102, commandNumIdFix);
	
	
	registerFix("item", 102, itemPotionDamageFix);
	registerFix("command", 102, commandPotionDamageFix);
	//TODO check if this is consistent
	
	registerFix("item", 105, itemSpawnEggFix);
	registerFix("command", 105, commandSpawnEggFix);
	
	registerFix("entity", 106, entityMinecartTypeFix);
	registerFix("command", 106, commandMinecartTypeFix);
	//TODO add fix to spawner Type, entityId, and commands with selector + dataTag;
	
	registerFix("block", 107, spawnerEntityIdFix);
	registerFix("command", 107, commandSpawnerEntityIdFix);
	//TODO add fix for minecart spawner
	
	registerFix("entity", 108, entityUUIDFix);
	
	
	registerFix("entity", 109, entityHealthFix);
	
	registerFix("entity", 110, horseSaddleFix);
	
	
	registerFix("entity", 111, itemFrameDirectionFix);
	
	registerFix("entity", 113, redundantDropChanceFix);
	
	
	
	/*
		Planned extra fix / optimizations :
			
			- see TODO comment above
			- fix about Linger tag and ligering_potion (is this even required?).
			- fix adding needed tag (like direction).
			- fix missing Count tag.
			- Fixing entity type based on selector.
			- replace ~0 -> 0
			- fix hoverevent show_entity type
			- fix playsoud sound id changes.
			- block data value to block state (extra care with default value and stuff)
			- Remove unecessary "minecraft:" (and make sure he is here when needed)
			- fix falling sand Tile / TileID tag.
			- make sure number keep their right type  (b, s, f, d)
			
		Low priority (not necessary and hard ) : 
			- Add some fix from 1.7 and older (not too old)
			- replace useless datatype chars (Invulnerable:1b -> Invulnerable:1b) only on 
			- remove unecessary quote around string (might be tricky with JSON and stuff. Probably have to list string tags) 
	*/
	
	
	/*
	
		Things that can't be fixed :
			- ItemRotation if there is no Direction tag.
	
	*/
	
	//Test fixs :
	
	//registerFix("selector", 100, function(data){console.log("found selector " + data);return data;});
	registerFix("selector", 100, fixSelectorType);
	//registerFix("command", 100, function(data){console.log("found command " + data);return data;});
	//registerFix("entity", 800, entityIdFix);
	registerFix("command", 800, commandIdFix);
	
	registerFix("entity", 2000, testFix);
	registerFix("item", 2000, testItemFix);
	registerFix("block", 2000, testFix);
	
	
	
	
}
