
/** Chilly bot
    version 1.0
	this bot runs on turntable fm, simply switch out the auth, userid, and roomid,
	and it will work with any account.
	credits: a big thanks to the people at the turntable api for all the input they gave
	me on the script. also a thanks to MikeWillis for his awesome song randomize algorithm.
	and a credit to alaingilbert for his help and the afk timer pattern. thanks to DubbyTT also for 
	the song skipping algorithm.
*/


/*******************************SetUp*****************************************************************************/


var Bot    = require('ttapi');
var AUTH   = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the auth of your bot here.
var USERID = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the userid of your bot here.
var ROOMID = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the roomid of the room you want the bot to go to here.
var roomName = 'straight chillin' //put your room's name here.
var ttRoomName = 'straight_chillin11' //your turntable.fm room name here, only the part that comes after turntable.fm/
var playLimit = 4; //set the playlimit here (default 4 songs), set to 0 for no limit
var songLengthLimit = 9.5; //set song limit in minutes, set to zero for no limit
var afkLimit = 20; //set the afk limit in minutes here
var HowManyVotesToSkip = 2; //how many votes for a song to get skipped
var spamLimit = 5; //number of times a user can spam being kicked off the stage within 10 secs

global.bannedArtists = ['dj tiesto', 'skrillex', 'lil wayne', 't-pain' , 'tpain' , 'katy perry', 'eminem', 'porter robinson', //banned artist/ song list (MUST BE LOWERCASE)
 'gorgoroth', 'justin bieber', 'deadmau5','rick roll', 'nosia', 'infected mushroom']; 
global.blackList = ['13131313131', '1313131313131']; //banned users list, put userids in string form here for permanent banning.
global.stageList = []; //put userids in here to ban from djing permanently

global.vipList = []; /* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
                        want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage.
						if there is only one vip, add the bots userid as well so that the vip can hear their own music.
					 */

var bot = new Bot(AUTH, USERID, ROOMID); //do not touch
bot.listen(xxxx, 'xxx.x.x.x');  //set the port and ip that you want the bot use here.

bot.debug = false; //prints all debugging information to the console in real time (alot of data)


/************************************EndSetUp**********************************************************************/




var getonstage = true;
var myId = null;
var detail = null;
var current = null;
var name = null;
var flag = null;
var dj = null;
var condition = null;
var index = null;
var song = null;
var album = null;
var genre = null;
var skipOn = null;
var queue = true;
var snagSong = null;
var lastSeen = {};
var lastSeen1 = {};
var lastSeen2 = {};
var people = [];
var AFK = true;
var MESSAGE = true;
var checkWhoIsDj;
var GREET = true;
var djs20 = [];
var randomOnce = 0;
var voteSkip = true;
var voteCountSkip = 0;
var votesLeft = HowManyVotesToSkip;
var djsOnStage = null;
var sayOnce = true;
var timer = null;
var artist = null;

global.userIds = [];
global.checkVotes = [];
global.theUsersList = [];
global.modList = [];
global.escortList = [];
global.currentDjs = [];
global.playList = [];
global.queueList = [];
global.queueName = [];
global.playListIds = [];
global.curSongWatchdog = null;
global.takedownTimer = null;
global.lastdj = null;
global.checkLast = null;
global.songLimitTimer = null;
global.beginTimer = null;


//updates the afk list
justSaw = function (uid)
	{
		return lastSeen[uid] = Date.now();
	};

//updates the afk list
justSaw1 = function (uid)
	{
		return lastSeen1[uid] = Date.now();
	};


//updates the afk list
justSaw2 = function (uid)
	{
		return lastSeen2[uid] = Date.now();
	};



//checks if a person is afk or not
isAfk = function (userId, num) 
	{
		var last = lastSeen[userId];
		var age_ms = Date.now() - last;
		var age_m = Math.floor(age_ms / 1000 / 60);
	if (age_m >= num) 
		{
			return true;
		};
	return false;
	};

//checks if a person is afk or not
isAfk1 = function (userId, num) 
	{
		var last = lastSeen1[userId];
		var age_ms = Date.now() - last;
		var age_m = Math.floor(age_ms / 1000 / 60);
	if (age_m >= num)
		{
			return true;
		};
	return false;
	};

//checks if a person is afk or not
isAfk2 = function (userId, num)
	{
		var last = lastSeen2[userId];
		var age_ms = Date.now() - last;
		var age_m = Math.floor(age_ms / 1000 / 60);
		if (age_m >= num)
			{
				return true;
			};
		return false;
	};

//removes afk dj's after afklimit is up.
afkCheck = function ()
	{   
		for (i = 0; i < currentDjs.length; i++) 
			{
				afker = currentDjs[i]; //Pick a DJ
				var isAfkMod = modList.indexOf(afker);
				var whatIsAfkerName = theUsersList.indexOf(afker) + 1;
				if ((isAfk1(afker, (afkLimit - 5))) && AFK == true)
					{
						if(afker != USERID && isAfkMod == -1) 
							{
								bot.speak('@' +theUsersList[whatIsAfkerName]+ ' you have 5 minutes left of afk, chat or awesome please.');
								justSaw1(afker);
							}
					}	  
				if ((isAfk2(afker, (afkLimit - 1))) && AFK == true)
					{
						if(afker != USERID && isAfkMod == -1) 
							{
								bot.speak('@' +theUsersList[whatIsAfkerName]+ ' you have 1 minute left of afk, chat or awesome please.');
								justSaw2(afker);
							}
					}	  
				if ((isAfk(afker, afkLimit)) && AFK == true) 
					{ //if Dj is afk then	   
						if(afker != USERID && isAfkMod == -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
							{
								if(afker != checkWhoIsDj)	
									{			
										bot.speak('@' +theUsersList[whatIsAfkerName]+ ' you are over the afk limit of ' +afkLimit+ ' minutes.');
										justSaw(afker);
										bot.remDj(afker); //remove them	
									}		 
							}
					}; 
			};
	};
setInterval(afkCheck, 5000) //This repeats the check every five seconds.



queueCheck15 = function(){
//if queue is turned on once someone leaves the stage the first person
//in line has 60 seconds to get on stage before being remove from the queue
if (queue == true && queueList.length != 0)
     {
	 if(sayOnce == true && djsOnStage < 5)
	   {
			sayOnce = false;	 
			bot.speak('@' + queueName[0] + ' you have 30 seconds to get on stage.');
			beginTimer = setTimeout( function()
				{ 
					queueList.splice(0, 2);
					queueName.splice(0, 1);  
					sayOnce = true;
				}, 30 * 1000);
		}
     }
}

setInterval(queueCheck15, 5000) //repeats the check every five seconds. 



vipListCheck = function(){
//this kicks all users off stage when the vip list is not empty
if (vipList.length != 0 && djsOnStage.length != vipList.length)
    {
		for(var p = 0; p < currentDjs.length; p++)
			{
				var checkIfVip = vipList.indexOf(currentDjs[p]);
				if(checkIfVip == -1)
					{
						bot.remDj(currentDjs[p]);
					}
			}
	}	
}


setInterval(vipListCheck, 5000) //repeats the check every five seconds. 

/*
repeatAfkMessage = function () 
	{
		if(AFK == true)
			{
				bot.speak('The afk limit is currently active, please chat or awesome to reset your timer.'); //this is your afk message.
			};
	};

setInterval(repeatAfkMessage, 600 * 1000) //repeats every 10 minutes if afk is set to on.
*/


repeatMessage = function () 
	{
		if(MESSAGE == true)
			{
				bot.speak('Welcome to ' + roomName + ', the rules are simple, ' + detail); //set the message you wish the bot to repeat here i.e rules and such.
			};
	};

setInterval(repeatMessage, 900 * 1000)  //repeats this message every 15 mins if /messageOn has been used.





bot.on('newsong', function (data){ 
  var length = data.room.metadata.current_song.metadata.length;

  
  
    //this is for the some length limit
 if(songLimitTimer != null)
	{
		clearTimeout(songLimitTimer);
		songLimitTimer = null;
		bot.speak("@"+theUsersList[checkLast+1]+", Thanks buddy ;-)");	
	}
  
  
  
  // If watch dog has been previously set, 
  // clear since we've made it to the next song
  if(curSongWatchdog != null)
	{
		clearTimeout(curSongWatchdog);
		curSongWatchdog = null;
	}
  
  
  
  // If takedown Timer has been set, 
  // clear since we've made it to the next song
  if(takedownTimer != null)
	{
		clearTimeout(takedownTimer);
		takedownTimer = null;
		bot.speak("@"+theUsersList[checkLast+1]+", Thanks buddy ;-)");	
	}

  
  
  // Set this after processing things from last timer calls
  lastdj = data.room.metadata.current_dj;
  checkLast = theUsersList.indexOf(lastdj);
  var modIndex = modList.indexOf(lastdj);
  
  

  
  // Set a new watchdog timer for the current song.
  
    curSongWatchdog = setTimeout( function() 
		{
			curSongWatchdog = null;
			bot.speak("@"+theUsersList[checkLast+1]+", you have 20 seconds to skip your stuck song before you are removed");
			//START THE 20 SEC TIMER
		takedownTimer = setTimeout( function()
			{
				takedownTimer = null;
				bot.remDj(lastdj); // Remove Saved DJ from last newsong call
			}, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
		}, (length + 10) * 1000); // Timer expires 10 seconds after the end of the song, if not cleared by a newsong
  
   
   
   //this boots the user if their song is over the length limit
   if((length / 60) >= songLengthLimit)
		{
	     if(songLengthLimit != 0 && modIndex == -1)
			{
				bot.speak("@"+theUsersList[checkLast+1]+", your song is over " +songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
				//START THE 20 SEC TIMER
				songLimitTimer = setTimeout( function()
					{
						songLimitTimer = null;
						bot.remDj(lastdj); // Remove Saved DJ from last newsong call
					}, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
			}
		}

});





//checks at the beggining of the song
 bot.on('newsong', function (data) { 
 
 //resets counters and array for vote skipping
 checkVotes = [];
 voteCountSkip = 0;
 votesLeft = HowManyVotesToSkip;
 
 
 
 //procedure for getting song tags
   song = data.room.metadata.current_song.metadata.song;
   album = data.room.metadata.current_song.metadata.album; 
   genre = data.room.metadata.current_song.metadata.genre;
   artist = data.room.metadata.current_song.metadata.artist;
 
 
 
 //adds a song to the end of your bots queue
if(snagSong == true)
 {
	bot.playlistAll(function(playlist) 
		{
			getSong = data.room.metadata.current_song._id;
			bot.playlistAdd(getSong, playlist.list.length); 
			console.log('DEBUGGING: ', getSong);
		}); 
 }  
 

  
  
 var userId = USERID; // the bots userid
 
 
 //used to check who the currently playing dj is.
 checkWhoIsDj = data.room.metadata.current_dj;
 var current = data.room.metadata.current_dj;
 
 
 //used to get current dj's name.
 dj = data.room.metadata.current_song.djname;
 bot.bop(); //automatically awesomes each song. will not awesome again until the next song.
 
 
 
 //used to have the bot skip its song if its the current player (if it has any)
 if(userId == current && skipOn == true)
 {
	bot.skip();
 }
 
 
 
  //puts bot on stage if there is one dj on stage, and removes them when there is 5 dj's on stage.
 current = data.room.metadata.djcount;
 if(current >= 1 && current <= 3 && queueList.length == 0)
 {
   if(getonstage == true && vipList.length == 0)
     {
		bot.addDj();
		current = null;
     }
 }
 
 if(current == 5 && getonstage == true)
	{
		bot.remDj();
		current = null;
	} 
	
	
 var checkIfAdmin = modList.indexOf(checkWhoIsDj);
  //removes current dj from stage if they play a banned song or artist.
 if(bannedArtists.length != 0)
	{
		for(var j = 0; j<bannedArtists.length; j++)
			{
				if(artist.toLowerCase().match(bannedArtists[j]) || song.toLowerCase().match(bannedArtists[j]))
					{
						if(checkIfAdmin == -1)
							{
								var nameDj = theUsersList.indexOf(checkWhoIsDj) + 1;
								bot.remDj(checkWhoIsDj);
								bot.speak('@' +theUsersList[nameDj]+ ' you have played a banned artist.');
								break;
							}
					}
			}
	}
});


 
 //bot gets on stage and starts djing if no song is playing.
bot.on('nosong', function (data) {
if(getonstage == true && vipList.length == 0)
	{
		bot.addDj();
	}
skipOn = false; 
})




//checks when the bot speaks
bot.on('speak', function (data) {  
  // Get the data
  var text = data.text;
  //name of person doing the command.
   name = data.name;   
  
  //checks to see if the speaker is a moderator or not.
   var modIndex = modList.indexOf(data.userid);  
    if (modIndex != -1)
		{
			condition = true;
		}
		else
		{
			condition = false;
		}
	
	//updates the afk position of the speaker.
	if(AFK == true);
		{
			justSaw(data.userid);
			justSaw1(data.userid);
			justSaw2(data.userid);
		}	
	
	
	
	

  if (text.match(/^\/autodj$/) && condition == true)
	{
		if(current < 5)
			{
				bot.addDj();
				current = null;
			}
	}  
  else if (text.match(/^\/randomSong$/) && condition == true)
	{
            if(randomOnce != 1)
				{           
					bot.playlistAll(function(playlist)
						{
							var i = 0;				
							bot.speak("Reorder initiated.");
							++randomOnce;
							var reorder = setInterval(function()
								{
									if(i <= playlist.list.length)
										{
											var nextId = Math.ceil(Math.random() * playlist.list.length);
											bot.playlistReorder(i, nextId);
											console.log("Song " + i + " changed.");
											i++;
										}
									else 
										{
											clearInterval(reorder);
											console.log("Reorder Ended");
											bot.speak("Reorder completed.");
											--randomOnce;
										}
								}, 1000);
				
						});		
				}			
	}  
  else if(text.match('turntable.fm/') && !text.match('turntable.fm/' + ttRoomName) && modIndex == -1)
	{
		bot.boot(data.userid, 'do not advertise other rooms here'); 
	}
  else if(text.match('/bumptop') && condition == true)
	{
		if(queue == true)
			{
				var topOfQueue = data.text.slice(10);
				var index35 = queueList.indexOf(topOfQueue);
				var index46 = queueName.indexOf(topOfQueue);
				var index80 = theUsersList.indexOf(topOfQueue);	
				var index81 = theUsersList[index80];
				var index82 = theUsersList[index80 - 1];
				if(index35 != -1 && index80 != -1)
					{
						queueList.splice(index35, 2);
						queueList.unshift(index81, index82);
						queueName.splice(index46, 1);
						queueName.unshift(index81);    
						bot.speak('The queue is now: ' + queueName);
					}
			}
  }   
  else if(text.match(/^\/voteskipon/) && condition == true)
	{ 
		checkVotes = [];  
		HowManyVotesToSkip = Number(data.text.slice(12))
		if(isNaN(HowManyVotesToSkip) || HowManyVotesToSkip == 0)
			{
				bot.speak("error, please enter a valid number");
			}
     
		if(!isNaN(HowManyVotesToSkip))
			{
				bot.speak("vote skipping is now active, current votes needed to pass "
							+ "the vote is " + HowManyVotesToSkip);
				voteSkip = true;
				voteCountSkip = 0;
				votesLeft = HowManyVotesToSkip;
			}
   }
  else if(text.match(/^\/voteskipoff$/) && condition == true)
	{    
		bot.speak("vote skipping is now inactive");
		voteSkip = false;
		voteCountSkip = 0;
		votesLeft = HowManyVotesToSkip;
	}
   else if(text.match(/^\/skip$/) && voteSkip == true)
	{
		var takeBotOff = modList.indexOf(USERID);
		var checkIfOnList = checkVotes.indexOf(data.userid)
		var checkIfMod = modList.indexOf(lastdj);
		if(takeBotOff != -1)
			{
				modList.splice(takeBotOff, 1);
			}   
		if(checkIfOnList == -1)
			{
				voteCountSkip += 1;
				votesLeft -= 1;
				checkVotes.unshift(data.userid);
	
				var findLastDj = theUsersList.indexOf(lastdj);
					if(votesLeft != 0 && checkIfMod == -1)
						{
							bot.speak("Current Votes for a song skip: " + voteCountSkip +
									  " Votes needed to skip the song: " + HowManyVotesToSkip);
						}
					if(votesLeft == 0 && checkIfMod == -1)
						{
							bot.speak("@" + theUsersList[findLastDj + 1] + " you have been voted off stage");
							bot.remDj(lastdj);
						}	 
			}
	}
   else if(text.match(/^\/afkon/) && condition == true)
	{
		AFK = true;
		bot.speak('the afk list is now active.');	
	}  
  else if(text.match(/^\/afkoff/) && condition == true)
	{
		AFK = false;
		bot.speak('the afk list is now inactive.');	
	}  
  else if(text.match(/^\/smoke/))
	{
		bot.speak('smoke em\' if ya got em.');	
	}  
  else if(text.match(/^\/skipsong/) && condition == true)
	{
		bot.skip();
	}  
  else if(text.match(/^\/props/))
	{
		bot.speak('@'+name+ ' gives ' + '@' +dj+ ' an epic high :hand:');
	}  
  else if(text.match(/^\/greeton/) && condition == true)
	{
		bot.speak('room greeting: On');
		GREET = true;
	} 
  else if(text.match(/^\/greetoff/) && condition == true)
	{
		bot.speak('room greeting: Off');
		GREET = false;
	} 
  else if(text.match(/^\/messageOn/) && condition == true)
	{
		bot.speak('message: On');
		MESSAGE = true;
	}  
  else if(text.match(/^\/messageOff/) && condition == true)
	{
		bot.speak('message: Off');
		MESSAGE = false;
	}  
  else if(text.match(/^\/commands/))
	{
		bot.speak('the commands are  /awesome, ' +
					' /mom, /chilly, /cheers, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, /skip, /dive, /admincommands, /queuecommands');
	}  
  else if(text.match(/^\/queuecommands/))
	{
		bot.speak('the commands are /queue, /removefromqueue, /removeme, /addme, /queueOn, /queueOff, /bumptop');
	}  
  else if(text.match('/admincommands') && condition == true)
	{
		bot.pm('the mod commands are /ban @, /unban, /skipon, /skipoff, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
			'/snagon, /snagoff, /removesong, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage, /unbanstage, /userid @, /inform' , data.userid);
		condition = false;
	}  
  else if (text.match(/^\/tableflip/))
	{
		bot.speak('/tablefix');  		
	}
  else if(text.match('awesome'))
	{
		bot.vote('up');
	}  
  else if(text.match('lame') && condition == true)
	{
		bot.vote('down');
	}
  else if (text.match(/^\/removedj$/) && condition == true)
	{
		bot.remDj();
	}
  else if (text.match(/^\/inform$/) && condition == true)
	{
		var checkDjsName = theUsersList.indexOf(checkWhoIsDj) + 1;
		bot.speak('@' +theUsersList[checkDjsName]+ ' your song is not the appropriate genre for this room, please skip or be removed');
	}
  else if (text.match(/^\/cheers$/))
	{
		bot.speak('@' +name+ ' raises their glass for a toast');
	}
  else  if (text.match(/^\/mom$/)) 
    {
		var x = Math.floor(Math.random() * 4);
		switch(x)
		{
			case 0: 
			bot.speak('@' + name + ' ur mom is fat');
			break;
			case 1:
			bot.speak('@' + name + ' yo momma sooo fat....');
			break;
			case 2:
			bot.speak('@' + name + ' damn yo momma fat');
			break;
			case 3:
			bot.speak('@' + name + ' your mother is an outstanding member of the community ' +
						'and well liked by all.');
			break;
		}
    }
  else if (text.match(/^\/dance$/)) 
	{
		bot.speak('http://www.gifbin.com/f/986269');
	}
  else if (text.match(/^\/chilly$/)) 
	{
		bot.speak('@'+name+' is pleasantly chilled.');
	}
  else if (text.match(/^\/skipon$/) && condition == true) 
	{
		bot.speak('i am now skipping my songs');
		skipOn = true;
	}
  else if (text.match(/^\/skipoff$/) && condition == true) 
	{
		bot.speak('i am no longer skipping my songs');
		skipOn = false;
	}
  else if (text.match(/^\/getonstage$/) && condition == true) 
	{
		if(getonstage == false)
			{
				bot.speak('I am now auto djing');
				getonstage = true;
			}
		else if(getonstage == true)
			{
				bot.speak('I am no longer auto djing');
				getonstage = false;
			}    
	}
  else if (text.match(/^\/beer$/))
		{
			bot.speak('@chillybot hands '+ '@'+name+' a nice cold :beer:');
		}
  else if (data.text == '/escortme') 
   {	
		var djListIndex = currentDjs.indexOf(data.userid);
		var escortmeIndex = escortList.indexOf(data.userid);
		if(djListIndex != -1 && escortmeIndex == -1)
			{
				escortList.push(data.userid);	
				bot.speak('@' + name + ' you will be escorted after you play your song');
			}
	}
  else if(data.text == '/stopescortme')
	{
		bot.speak('@' + name + ' you will no longer be escorted after you play your song');
		var escortIndex = escortList.indexOf(data.userid);
		if(escortIndex != -1)
			{
				escortList.splice(escortIndex, 1);
			}
	}
  else if(data.text == '/roominfo')
	{
		bot.speak(detail);
	}  
  else if(data.text == '/fanme')
	{
		bot.speak('@' + name + ' i am now your fan!');
		myId = data.userid;
		bot.becomeFan(myId);
	}
  else if(data.text == '/getTags')
	{
		bot.speak('artist name: '+artist+ ', song name: ' + song + ', album: ' + album + ', genre: ' + genre);
	}
  else if(data.text == '/dice')
	{
		var num = 0;
		var random = Math.floor(Math.random() * 6 + 1);
		bot.speak('@' + name + ' i am rolling the dice...');
		num = 1;
			if(num =1)
				{
					bot.speak('your number is... ' +random);
					num = 0;
				}
	}  
  else if(text.match(/^\/dive/))
	{
		var checkDj = currentDjs.indexOf(data.userid);
		if(checkDj != -1)
			{
				bot.remDj(data.userid);
			}
		else
			{
				bot.pm('you must be on stage to use that command.', data.userid);
			}
	}
  else if(text.match('/surf'))
	{
		bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
	}
  else if(data.text == '/unfanme')
	{
		bot.speak('@' + name + ' i am no longer your fan.');
		myId = data.userid;
		bot.removeFan(myId);
	}
  else if (text.match(/^\/m/)) 
	{
		bot.speak(text.substring(3));	
	}
  else if (text.match(/^\/hello$/))
	{
		bot.speak('Hey! How are you @'+name+'?');
	}  
  else if (text.match(/^\/snagon$/) && condition == true)
	{  
		snagSong = true;
		bot.speak('snag: ON');
	}
   else if (text.match(/^\/snagoff$/) && condition == true)
	{  
		snagSong = false;
		bot.speak('snag: OFF');
	}
  
   else if (text.match(/^\/removesong$/) && condition == true)
	{  
		bot.playlistAll(function(playlist)
			{	 
				if(checkWhoIsDj == USERID)
					{
						var remove = playlist.list.length - 1;
						bot.skip();	 
						bot.playlistRemove(remove);
						bot.speak('the last snagged song has been removed.');
					}
				else
					{
						var remove = playlist.list.length - 1;	 
						bot.playlistRemove(remove);
						bot.speak('the last snagged song has been removed.');
					}
			})
  }
  else if (text.match(/^\/queue$/))
	{  
		if(queue == true)
			{
				bot.speak('The queue is now: ' + queueName);
			}
		else
			{
				bot.speak('There is currently no queue.');
			}	
	}
  else if (text.match('/removefromqueue') && queue == true)
	{
		if(condition == true)   
			{
				var removeFromQueue = data.text.slice(18);
				var index5 = queueList.indexOf(removeFromQueue);
				var index6 = queueName.indexOf(removeFromQueue);
			if(index5 != -1)
				{
					queueList.splice(index5, 2);
					queueName.splice(index6, 1);
					bot.speak('The queue is now: ' + queueName);
				}	
			}
	}
  else if (text.match(/^\/removeme$/) && queue == true) 
	{  
		var list1 = queueList.indexOf(data.name);
		if(list1 != -1)
			{
				queueList.splice(list1, 2);
			}
		var list2 = queueName.indexOf(data.name);
		if(list2 != -1)
			{
				queueName.splice(list2, 1);
				bot.speak('The queue is now: ' + queueName);
			}	
	}
  else if (text.match(/^\/addme$/) && queue == true)
	{  
		var list3 = queueList.indexOf(data.name);
		var list10 = currentDjs.indexOf(data.userid)
		var checkStageList = stageList.indexOf(data.userid);
		if(list3 == -1 && list10 == -1 && checkStageList == -1)
			{
				queueList.push(data.name, data.userid);
				queueName.push(data.name);
				bot.speak('The queue is now: ' + queueName);
			}	
	}
  else if (text.match(/^\/queueOn$/) && condition == true)
	{  
		queueList = [];
		queueName = [];
		bot.speak('the queue is now active.');
		queue = true;	
		for (var i = 0; i < currentDjs.length; i++)
			{
				djs20[currentDjs[i]] = { nbSong: 0 };
			}  
	}
  else if(text.match('/surf'))
   {
		bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
   }
  else if (text.match(/^\/queueOff$/) && condition == true)
	{  
		bot.speak('the queue is now inactive.');
		queue = false;
	}  
  else if(text.match('/banstage') && condition == true)
	{  
		var ban = data.text.slice(11);
		var checkBan = stageList.indexOf(ban);
		var checkUser = theUsersList.indexOf(ban);
		if (checkBan == -1 && checkUser != -1)
			{
				stageList.push(theUsersList[checkUser-1], theUsersList[checkUser]);
				bot.remDj(theUsersList[checkUser-1]);		  
				condition = false;
			}
	}  
  else if(text.match('/unbanstage') && condition == true)
	{
		var ban2 = data.text.slice(13);
		index = stageList.indexOf(ban2);
		if(index != -1)
			{    
				stageList.splice(stageList[index-1], 2);	 
				console.log('DEBUGGING: ', blackList);
				condition = false;	  
				index = null;
			}
	}     
  else if(text.match('/ban') && condition == true)
	{  
		var ban = data.text.slice(6);
		var checkBan = blackList.indexOf(ban);
		var checkUser = theUsersList.indexOf(ban);
		if (checkBan == -1 && checkUser != -1)
			{
				blackList.push(theUsersList[checkUser-1], theUsersList[checkUser]);
				bot.boot(theUsersList[checkUser-1]);		  
				condition = false;
			}
	}  
  else if(text.match('/unban') && condition == true)
	{
		var ban2 = data.text.slice(8);
		index = blackList.indexOf(ban2);
	if(index != -1)
		{    
			blackList.splice(blackList[index-1], 2);	 
			console.log('DEBUGGING: ', blackList);
			condition = false;	  
			index = null;
		}
	}
  else if(text.match('/userid') && condition == true)
	{  
		var ban = data.text.slice(9);
		var checkUser = theUsersList.indexOf(ban);
		if (checkUser != -1)
			{
				bot.pm(theUsersList[checkUser-1], data.userid);		  
				condition = false;
			}
	}  
});


//checks who voted and updates their position on the afk list.
bot.on('update_votes', function (data){
	if(AFK == true);
		{
			justSaw(data.room.metadata.votelog[0][0]);	
			justSaw1(data.room.metadata.votelog[0][0]);		
			justSaw2(data.room.metadata.votelog[0][0]);
		}	
	
 })


//checks who added a song and updates their position on the afk list. 
bot.on('snagged', function (data) {
	if(AFK == true);
		{
			justSaw(data.userid);
			justSaw1(data.userid);
			justSaw2(data.userid);
		}	
 })





//checks when a dj leaves the stage
bot.on('rem_dj', function (data) {

//removes one from dj count
djsOnStage -= 1;


//removes user from the dj list when they leave the stage
delete djs20[data.user[0].userid];


//updates the current dj's list.
if(AFK == true);
	{
		var check30 = currentDjs.indexOf(data.user[0].userid);
		currentDjs.splice(check30, 1);
	}




//takes a user off the escort list if they leave the stage.
var checkEscort = escortList.indexOf(data.user[0].userid);

var user = data.user;
if (checkEscort != -1)
	{
		escortList.splice(checkEscort, 1);
	}
var checkDj = currentDjs.indexOf(data.user[0].userid);

if (checkDj != -1)
	{
		currentDjs.splice(checkDj, 1);
	}
 })
 

 
 //this activates when a user joins the stage.
bot.on('add_dj', function (data) {

//removes dj when they try to join the stage if the vip list has members in it.
var checkVip = vipList.indexOf(data.user[0].userid);
if(vipList.length != 0 && checkVip == -1)
	{
		bot.remDj(data.user[0].userid);
		bot.pm('The vip list is currently active, only the vips may dj at this time', data.user[0].userid);
	}


//adds one to dj count
djsOnStage += 1;


//sets dj's songcount to zero when they enter the stage.
djs20[data.user[0].userid] = { nbSong: 0 };


//checks if user is a moderator.
 var modIndex = modList.indexOf(data.user[0].userid);
    if (modIndex != -1)
		{
			condition = true;
		}
	else
		{
			condition = false;
		}
	
	
	
//updates the afk position of the person who joins the stage.
if(AFK == true);
	{
		justSaw(data.user[0].userid);
		justSaw1(data.user[0].userid);
		justSaw2(data.user[0].userid);
	}		
	
	
	
//adds a user to the afk list when they join the stage.
if(AFK == true && condition == false);
	{
		currentDjs.push(data.user[0].userid);
	}




//tells a dj trying to get on stage how to add themselves to the queuelist
var ifUser2 = queueList.indexOf(data.user[0].userid);
if(queue == true && ifUser2 == -1) 
	{
		if(queueList.length != 0)
			{
				bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
			}
	}
	


//removes a user from the queue list when they join the stage.
if(queue == true)
	{
	//var ifUser = queueList.indexOf(data.user[0].userid);
	var firstOnly = queueList.indexOf(data.user[0].userid);
	var queueListLength = queueList.length;
	console.log(queueList, queueName);
	if(firstOnly != 1 && queueListLength != 0)     
		{       
			console.log("removed");
			bot.remDj(data.user[0].userid);
			++people[data.user[0].userid].spamCount;
			clearTimeout(timer);
			if(timer != null)
				{						
					clearTimeout(timer);
					timer = null;
				}
			timer = setTimeout(function()
				{
					people[data.user[0].userid] = { spamCount: 0 };
				}, 10 * 1000);	
		}
	}
if(queue == true)
	{
		var checkQueue = queueList.indexOf(data.user[0].name);
		var checkName2 = queueName.indexOf(data.user[0].name);
		console.log('DEBUGGING: ', checkQueue);
		if(checkQueue != -1 && checkQueue == 0)
			{
				clearTimeout(beginTimer);
				sayOnce = true;
				queueList.splice(checkQueue, 2);
				queueName.splice(checkName2, 1);
			}
	}

//checks to see if user is on the banned from stage list, if they are they are removed from stage
   for (var g=0; g<stageList.length; g++) 
	{
		if (data.user[0].userid == stageList[g])
			{
				bot.remDj(data.user[0].userid);
				bot.speak('@' +data.user[0].name+ ' you are banned from djing');
				++people[data.user[0].userid].spamCount;
				if(timer != null)
					{						
						clearTimeout(timer);
						timer = null;
					}
				timer = setTimeout(function()
					{
						people[data.user[0].userid] = { spamCount: 0 };
					}, 10 * 1000);	
				break;
			}
	}
	
	
	
//if person exceeds spam count within 10 seconds they are kicked
if(people[data.user[0].userid].spamCount >= spamLimit)
	{		
		bot.boot(data.user[0].userid, 'stop spamming');
	}
	
 })

 
 
 
 
//checks when the bot recieves a pm
 bot.on('pmmed', function (data) {
 var text = data.text;
 var name1 = theUsersList.indexOf(data.senderid) + 1;
 //checks to see if the speaker is a moderator or not.
 var modIndex = modList.indexOf(data.senderid);  
 if (modIndex != -1)
	{
		condition = true;
	}
 else
	{
		condition = false;
	}	
 if (text.match(/^\/chilly$/)) 
	{
		bot.speak('@'+theUsersList[name1]+' is pleasantly chilled.');
	}
 else if (text.match(/^\/m/) && condition == true)
	{
		bot.speak(text.substring(3));	
	}  
  else if(text.match('/stage') && condition == true)
	{  
		var ban = data.text.slice(8);
		var checkUser = theUsersList.indexOf(ban) -1;
		if (checkUser != -1)
			{
				bot.remDj(theUsersList[checkUser]);
				condition = false;
			}
	} 
  else if(text.match('/banstage') && condition == true)
	{  
		var ban = data.text.slice(11);
		var checkBan = stageList.indexOf(ban);
		var checkUser = theUsersList.indexOf(ban);
		if (checkBan == -1 && checkUser != -1)
			{
				stageList.push(theUsersList[checkUser-1], theUsersList[checkUser]);
				bot.remDj(theUsersList[checkUser-1]);		  
				condition = false;
			}
	}  
  else if(text.match('/unbanstage') && condition == true)
	{
		var ban2 = data.text.slice(13);
		index = stageList.indexOf(ban2);
		if(index != -1)
			{    
				stageList.splice(stageList[index-1], 2);	 
				console.log('DEBUGGING: ', blackList);
				condition = false;	  
				index = null;
			}
	}    
 else if(text.match('/userid') && condition == true)
	{  
		var ban = data.text.slice(9);
		var checkUser = theUsersList.indexOf(ban);
		if (checkUser != -1)
			{
				bot.pm(theUsersList[checkUser-1], data.senderid);		  
				condition = false;
			}
	}  
  else if(text.match('/ban') && condition == true)
	{  
		var ban = data.text.slice(6);
		var checkBan = blackList.indexOf(ban);
		var checkUser = theUsersList.indexOf(ban);
		if (checkBan == -1 && checkUser != -1)
			{
				blackList.push(theUsersList[checkUser-1], theUsersList[checkUser]);
				bot.boot(theUsersList[checkUser-1]);		  
				condition = false;
			}
	}  
  else if(text.match('/unban') && condition == true)
	{
		var ban2 = data.text.slice(8);
		index = blackList.indexOf(ban2);
		if(index != -1)
			{    
				blackList.splice(blackList[index-1], 2);	 
				console.log('DEBUGGING: ', blackList);
				condition = false;	  
				index = null;
			}
	}    
  else if(data.text == '/stopescortme')
	{
		bot.pm('you will no longer be escorted after you play your song', data.senderid);
		var escortIndex = escortList.indexOf(data.senderid);
		if(escortIndex != -1)
			{
				escortList.splice(escortIndex, 1);
			}
	}
  else if (data.text == '/escortme') 
	{	
		var djListIndex = currentDjs.indexOf(data.senderid);
		var escortmeIndex = escortList.indexOf(data.senderid);
		if(djListIndex != -1 && escortmeIndex == -1)
			{
				escortList.push(data.senderid);	
				bot.pm('you will be escorted after you play your song', data.senderid);
			}
	}
  else if(text.match(/^\/commands/))
	{
		bot.pm('the commands are  /awesome, ' +
					' /mom, /chilly, /cheers, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, /skip, /dive, /admincommands, /queuecommands', data.senderid);
	}   
  else if(text.match(/^\/queuecommands/))
	{
		bot.pm('the commands are /queue, /removefromqueue, /removeme, /addme, /queueOn, /queueOff, /bumptop', data.senderid);
	}  
  else if(text.match(/^\/pmcommands/) && condition == true)
	{
		bot.pm('/admincommands, /queuecommands, /commands, /banstage @, /unbanstage @, /ban @, /unban @, /stage @, /m, /chilly, /escortme, /stopescortme', data.senderid);
	}  
  else if(text.match('/admincommands') && condition == true)
	{
		bot.pm('the mod commands are /ban @, /unban, /skipon, /skipoff, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
				'/snagon, /snagoff, /removesong, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage, /unbanstage, /userid @, /inform' , data.senderid);
		condition = false;
	}  
 });
 
 



//starts up when bot first enters the room
bot.on('roomChanged', function (data) {


//finds out who the currently playing dj's are.
currentDjs = data.room.metadata.djs;


//counts how many djs there are on stage
djsOnStage = currentDjs.length;




//initializes currently playing dj's song count to zero.
var currentPlayers = data.room.metadata.djs;
for (var i = 0; i < currentPlayers.length; i++) 
	{
		djs20[currentPlayers[i]] = { nbSong: 0 };
	}

  
  
  
//list of escorts, users, and moderators is reset    
escortList = [];
theUsersList = [];
modList = [];  


	
//set modlist to list of moderators
modList = data.room.metadata.moderator_id;	
	
  
  
  
//used to get room description
detail = data.room.description;



//used to get user names and user id's
  var users = data.users;
for (var i=0; i<users.length; i++)
	{
		var user = users[i];
		user.lastActivity = user.loggedIn = new Date();
		theUsersList.push(user.userid, user.name);
		userIds.push(user.userid);
	}


	
	
//sets everyones spam count to zero	
for (var z = 0; z < userIds.length; z++) 
	{
		people[userIds[z]] = { spamCount: 0 };
	}
	

});






//starts up when a new person joins the room
bot.on('registered', function (data) {

if(queue == true && djsOnStage == 5)
	{
		bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
	}


//gets newest user and prints greeting
var roomjoin = data.user[0];
if (GREET == true)
	{
		bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ' enjoy your stay!');
	}
     
   
   
//adds users who join the room to the user list if their not already on the list
var checkList = theUsersList.indexOf(data.user[0].userid);
if(checkList == -1)
	{
		theUsersList.push(data.user[0].userid, data.user[0].name);
	}
	 
	 
	 
//checks to see if user is on the banlist, if they are they are booted from the room.
for (var i=0; i<blackList.length; i++)
	{
		if (roomjoin.userid == blackList[i])
			{
				bot.bootUser(roomjoin.userid, 'You are on the banlist.');
				break;
			}
	}  

	
//sets new persons spam count to zero
people[data.user[0].userid] = { spamCount: 0 };
  
});






//updates the moderator list when a moderator is removed.
bot.on('rem_moderator', function (data) { 
var test51 = modList.indexOf(data.userid);
modList.splice(test51, 1);
console.log('DEBUGGING: ',modList);
})





//updates the moderator list when a moderator is added.
bot.on('new_moderator', function (data) {
var test50 = modList.indexOf(data.userid);
if(test50 == -1)
	{
		modList.push(data.userid);
		console.log('DEBUGGING: ',modList);
	}
})






 //starts up when a user leaves the room
bot.on('deregistered', function (data) {

//removes dj's from the lastSeen object when they leave the room
delete lastSeen[data.user[0].userid];
delete lastSeen1[data.user[0].userid];
delete lastSeen2[data.user[0].userid];
delete people[data.user[0].userid];


//updates the users list when a user leaves the room.
var user = data.user[0].userid;
var checkLeave = theUsersList.indexOf(data.user[0].userid);
var checkUserIds = userIds.indexOf(data.user[0].userid);
if (checkLeave != -1)
	{
		theUsersList.splice(checkLeave, 2);
		userIds.splice(checkUserIds, 1);
	}	
 })




//activates at the end of a song.
bot.on('endsong', function(data) {         
	
	//iterates through the dj list incrementing dj song counts and
	//removing them if they are over the limit.
	
	var djId = data.room.metadata.current_dj;
    if (djs20[djId] && ++djs20[djId].nbSong >= playLimit)
		{
			var checklist33 = theUsersList.indexOf(djId) + 1;
			var checklist34 = modList.indexOf(djId);
			if(checklist34 == -1 && queue == true) //only enforces when queue is turned on, does not remove moderators
				{
					if(djId != USERID && playLimit != 0) //&& queueList.length != 0) //uncomment this to only enforce the song limit when there are people in the queue
						{
							bot.speak('@' + theUsersList[checklist33] + ' you are over the playlimit of ' + playLimit + ' songs'); 
							bot.remDj(djId);
						}
				}
			delete djs20[djId];
		}
	
		
     //iterates through the escort list and escorts all djs on the list off the stage.	  
	for (var i = 0; i<escortList.length; i++)
		{
			if(data.room.metadata.current_dj == escortList[i])
				{
					var lookname = theUsersList.indexOf(data.room.metadata.current_dj) + 1;
					bot.remDj(escortList[i]);
					bot.speak('@'+theUsersList[lookname]+ ' had enabled escortme');
					var removeFromList = escortList.indexOf(escortList[i]);
					escortList.splice(removeFromList, 1);
				}
		}
 
});


