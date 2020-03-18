var db = {}
$.ajaxSettings.async=false;
$.getJSON("img/game/character_table.json", function(data)
{
	db["char"] = data
})
$.getJSON("img/game/skill_table.json", function(data)
{
	db["skill"] = data
})
$.getJSON("img/game/skin_table.json", function(data)
{
	db["skin"] = data.charSkins
})
$.ajaxSettings.async=true;

var limitedName = ""

var page = 0
var dataPerPage = parseInt($("#perPage").attr("data"))
function render()
{
	limitedName = $("#sTxt").val()
	var found = []
	if (limitedName != "")
	{
		for (var i = 0; i < db.bot["length"]; i++)
		{
			var nick = db.bot.data[i]["nickName"]
			if (nick.indexOf(limitedName) >= 0)
			{
				found.push(db.bot.data[i])
			}
		}
	}
	var realDb2 = []
	if (found.length != 0 || limitedName != "")
	{
		realDb2 = found
	}
	else
	{
		realDb2 = db.bot.data
	}
	var realDb = []
	var max = {}
	for (var i = 0; i < realDb2.length; i++)
	{
		var assists = realDb2[i].assistCharList
		max[i] = 0
		for (var j = 0; j < assists.length; j++)
		{
			if (assists[j].record > max[i])
			{
				max[i] = assists[j].record
			}
		}
	}
	var sdic = Object.keys(max).sort(function(a, b){return max[b] - max[a];});
	for (var k in sdic)
	{
		realDb.push(realDb2[sdic[k]])
	}
	if (page < 0)
		page = 0
	if (page * dataPerPage > realDb.length)
		page = parseInt(realDb.length / dataPerPage)
	if (page * dataPerPage == realDb.length)
		page--
	if (realDb.length == 0)
		page = 0
	var tbody = document.getElementById("table")
	if (tbody.innerHTML != "")
	{
		tbody.innerHTML = ""
	}
	var tr = tbody.insertRow(0)
	var header = "服务器|游戏ID|助战1|助战2|助战3".split('|')
	for (var i = 0; i < header.length; i++)
	{
		var th = document.createElement("th")
		th.innerHTML = header[i]
		tr.appendChild(th)
	}
	var fox = dataPerPage * page + dataPerPage
	if (fox > realDb.length)
		fox = realDb.length
	for (var i = dataPerPage * page; i < fox; i++)
	{
		var nick = realDb[i]["nickName"]
		tr = tbody.insertRow(((i + 1) - dataPerPage * page) % (dataPerPage + 1))
		var server = tr.insertCell(0)
		server.setAttribute("class", "sr")
		server.innerHTML = "<center>" + (realDb[i].server ? "B服" : "官服") +"</center>"
		var id = tr.insertCell(1)
		id.innerHTML = "<center>" + nick + "</center>" 
		if (realDb[i]["msg"] != undefined)
		{
			id.innerHTML += "<hr>"
			id.innerHTML += "<center>" + realDb[i]["msg"] + "</center>"
		}
		var assists = realDb[i].assistCharList
		for (var j = 0; j < assists.length; j++)
		{
			var sk = db.skin[assists[j].skinId]
			var img = document.createElement("img")
			img.src = "img/char/" + sk["avatarId"].replace(/#/g, "%23") + ".png";
			img.width = 150;
			(function(a, b)
			{
				img.addEventListener('click', function()
				{
					var skillLv = realDb[a].assistCharList[b].mainSkillLvl
					var skillId = realDb[a].assistCharList[b].skillId
					var charId = realDb[a].assistCharList[b].charId
					var show = db.char[charId].name + "\n"
					show += "精英阶段" + realDb[a].assistCharList[b].evolvePhase + "\n"
					show += "Lv." + realDb[a].assistCharList[b].level + "\n"
					show += "潜能等级" + (realDb[a].assistCharList[b].potentialRank + 1) + "\n"
					if (skillId != "")
						show += db.skill[skillId].levels[skillLv - 1].name + " Lv." + skillLv
					$("#detail").val(show)
				})
			})(i, j)
			
			var p = tr.insertCell(j + 2)
			var g = document.createElement("span")
			g.setAttribute("class", "triangle-topleft")
			g.style.position = "absolute"
			p.appendChild(g)
			var levelDiv = document.createElement("div")
			levelDiv.style['font-size'] = '25px'
			var level = document.createElement("span")
			level.style.position = "absolute"
			level.innerText = assists[j].record
			levelDiv.appendChild(level)
			levelDiv.appendChild(img)
			p.setAttribute("class", "imgt")
			p.appendChild(levelDiv)

		}
	}
}

$.getJSON($("#file").attr("data"), function(botData)
{
	db["bot"] = botData
	var date = new Date(botData.time * 1000)
	document.getElementById("time").innerHTML = date.toLocaleDateString() + " " + date.toTimeString().substr(0, 8)
	render()
})

function prev()
{
	page--;
	render()
}

function next()
{
	page++;
	render()
}

function reset()
{
	page = 0
	$("#sTxt").val("")
	render()
}

function commit()
{
	var gameId = $("#gameId").val()
	var userId = $("#userId").val()
	var serverId = $('input:radio[name="server"]:checked').val()
	var param = {"gameId": gameId, "userId": userId, "serverId": serverId}
	$.ajax('https://service-8tk9nq4g-1254119946.gz.apigw.tencentcs.com/release/update_user',{
		data:param,
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		success:function(data){
			if (data.result != 0)
			{
				alert(data.msg)
			}
			else
			{
				alert("添加成功！请等待刷新\n如添加错误请等待刷新后重新添加")
			}
		}
	});
}