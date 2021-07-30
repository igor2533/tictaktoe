var socket;

var user = {
	id: null,
	game: null,
	gameFields: null,
	you: null, // true - X, false - O
	step: null, // true - client step, false - friend step
};

$(function () {	

	




	socket = io();

	socket.emit('new_user');
	
	socket.on("new_user", function(data) {
		$("#main_block").fadeIn('slow');
		$("#my-id").text(data.id);
		user.id = data.id;
		
		var room = new URLSearchParams(window.location.search).get('room');
		if(room != undefined) joinRoom(room);
	});
	


	socket.on("result_filters", function(data) {

      Object.keys(data).forEach(function(key){
		  var row = data[key];
		  $(".filter-buttons").append("<button class='btn btn-primary filter-button' data-filter='"+row.text+"'>"+row.text+"</button>");
	  })



	  $(".filter-button").click(function(){


		console.log('da');
  
	  var value = $(this).attr('data-filter');
	  
	  if(value == "all")
	  {
		  //$('.filter').removeClass('hidden');
		  $('.filter').show('1000');
	  }
	  else
	  {
  //            $('.filter[filter-item="'+value+'"]').removeClass('hidden');
  //            $(".filter").not('.filter[filter-item="'+value+'"]').addClass('hidden');
		  $(".filter").not('.'+value).hide('3000');
		  $('.filter').filter('.'+value).show('3000');
		  
	  }
  });


	});



    socket.on("result_client", function(data) {
        let results = data;
                      
					const myData = results;

						$(()=>{
							$('.example').multiSelect({
								// required


								data: myData,
					
								listen(tags, item, operate){
									console.log(tags, item, operate);
									
								},
					
								compare(item1){
					
									// if(item1.text.length > item2.text.length){
										return true;
									// }else{
										// return false;
									// }
								}
					
					
					
					})
				});



				Object.keys(data).forEach(function(key){
					var row = data[key];
					$(".m--s-tag-container").append("<button class='btn btn-primary filter-button' data-filter='"+row.text+"'>"+row.text+"</button>");
				})




			});

	socket.on("results_mysql", function(data) {

	    console.log(data)
	});
	socket.on("join_room", function(data) {
		

		
		jQuery("div#game_block").show();
		jQuery(".container.filter-buttons").hide();
	jQuery(".container.games-block").hide();
	jQuery(".container.create-rooms").hide();
	jQuery("div#lists_r").hide();
		
		history.replaceState(null, null, "?room=" + data.id);
		
		if(data.game.spectators.indexOf(user.id) == -1) user.you = data.game.pOne == user.id ? true : false;

		$("#status_game").text(getStatusGame(data.game.status));
		$("#play_for").text(getPlayFor(user.you));
		
		user.game = data.id;
		
		$("#x-score").text(data.game.score.X);
		$("#o-score").text(data.game.score.O);
		$("#draw-score").text(data.game.score.draw);
	});
	
	socket.on("start_game", function(game) {
		$("#play_for").text(getPlayFor(user.you));
		
		$("#modal").css("display", "none");
		
		if(game.spectators.indexOf(user.id) != -1) return;
		
		user.you = game.pOne == user.id ? true : false;
		
		if(game.status == 1 && user.you) user.step = true;
		else if(game.status == 2 && !user.you) user.step = true;
		else user.step = false;
		
		if(user.step) addHover();
		
		$(".square").each(function(e) {
			$(this).attr("id", e);
			
			$(this).click(function(e) {
				selectSquare(e.target.id);
			});
		});
	});
	
	socket.on("update_game", function(game) {
		$("#status_game").text(getStatusGame(game.status));
		
		if(game.spectators.indexOf(user.id) == -1) {
			if(game.status == 1 && user.you) user.step = true;
			else if(game.status == 2 && !user.you) user.step = true;
			else user.step = false;

			if(user.step) {
				setTimeout(function() {
					addHover();
				}, 25);
			}
		}
		
		console.log(game);
		
		user.gameFields = game.fields;

		for(var line in game.fields) {
			for(var column in game.fields[line]) {
				$("#game_block #" + (parseInt(line) * 3 + parseInt(column))).text(game.fields[line][column] != null ? game.fields[line][column] : "");
				if(game.fields[line][column] != null) {
					(function(line, column) {
						setTimeout(function() {
							$("#game_block #" + (parseInt(line) * 3 + parseInt(column))).removeClass("sq-hov");
						}, 25)
					})(line, column)
				}
			}
		}
		
		if(game.status == 3) {
			removeHover();
			$("#modal").css("display", "block");
			$("#game-over-message").text(game.winner == "draw" ? "Ничья" : (game.winner + " winner!"));
			
			$("#x-score").text(game.score.X);
			$("#o-score").text(game.score.O);
			$("#draw-score").text(game.score.draw);
		
		     location.reload();
		}
	});
	
	socket.on("leave_room", function(game) {
		$("#modal").css("display", "block");
		$("#game-over-message").text(game == null ? "The game does not exist" : "One player is out");
		setTimeout(function() {
			$("#modal").css("display", "none");
		
			
			leaveRoom();
		}, 2 * 1000);
	});
	

	


	$("button.addts").click(function() {
		console.log('space pressed');
			   var newtag = jQuery("input.m--s-real-ipt").val();
			   socket.emit('addtag', newtag);

			 
			   $(".m--s-tag-container").append("<div class='m--s-tag' value=''><div class='m--s-tag-txt'>"+newtag+"</div><div class='m--s-tag-del'></div></div>");
			   jQuery("input.m--s-real-ipt").val("");


	});



	socket.on("update_rooms", function(data) {
		$("#lists_r").html('');




		for(var i in data) {

			var qer = data[i].tags[0].join(' ');

			//console.log(data[i].tags);
			$("#lists_r").append(
				'<div class="col-sm-3 filter '+qer+'"><img src="https://images.unsplash.com/photo-1576675784201-0e142b423952?ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWwlMjByb29tfGVufDB8fDB8fA%3D%3D&amp;ixlib=rb-1.2.1&amp;w=1000&amp;q=80"><a href="#" class="" onclick="joinRoom(\'' + i + '\');return false;">' +
					'<div class="media text-muted pt-3">' +
						'<p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">' +
							'<strong class="d-block text-gray-dark">@' + i + '</strong>' +
							(data[i].status == 0 ? "1 из 2 мест свободно" : "Game now") +
						'</p>' +
					'</div>' +
				'</a></div>'
			);
		}
	});
	
	socket.on("reconnect", function() {
		$("#main_block").fadeOut('fast');
		$("#game_block").fadeOut('fast');
		$("#error_block").fadeIn('slow');
	});

});

function createRoom() {
	cats = [];
	$('.m--s-tag').each(function() {
		cats.push($(this).text());
	  });


	socket.emit("create_room",cats);



	jQuery(".container.filter-buttons").hide();
	jQuery(".container.games-block").hide();
	jQuery(".container.create-rooms").hide();
	jQuery("div#lists_r").hide();
	
}

function joinRoom(id) {
	socket.emit("join_room", id);
}

function selectSquare(id) {
	if(user.game == null || !user.step) return;
	if(user.gameFields[Math.floor(id / 3)][Math.floor(id % 3)] != null) return;
	user.gameFields[Math.floor(id / 3)][Math.floor(id % 3)] = user.you ? "X" : "O";
	removeHover();
	$("#status_game").text("Переход хода");
	$("#game_block #" + id).text(user.you ? "X" : "O");
	$("#game_block #" + id).removeClass("sq-hov");
	socket.emit("select_square", id);
}

function addHover() {
	$(".square").each(function(e) {
		$(this).addClass('sq-hov');
	});
}

function removeHover() {
	$(".square").each(function(e) {
		$(this).removeClass('sq-hov');
	});
}

function leaveRoom() {
	user.game = null;
	user.gameFields = null;
	user.you = null;
	user.step = null;
	$("#game_block").fadeOut('fast');
	$("#main_block").fadeIn('slow');
	history.replaceState(null, null, "/");
}

/* get's */

function getStatusGame(status) {
	switch(status) {
		case 0: return "Wait players";
		case 1: return "move X";
		case 2: return "move О";
		default: return null;
	}
} 

function getPlayFor(you) {
	if(you == null) return "Spectator";
	return you ? "X" : "O";
} 
