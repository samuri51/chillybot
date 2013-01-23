/** Chilly bot
    version 1.0
	this bot runs on turntable fm, simply switch out the auth, userid, and roomid,
	and it will work with any account.
	credits: a big thanks to the people at the turntable api for all the input they gave
	me on the script. also a thanks to MikeWillis for his awesome song randomize algorithm.
	and a credit to alaingilbert for his help and the afk timer pattern. thanks to DubbyTT also for 
	the song skipping algorithm.
*/


/*******************************BeginSetUp*****************************************************************************/


var Bot = require('ttapi');
var AUTH = 'xxxxxxxxxxxxxxxxxxxxxxxx'; //set the auth of your bot here.
var USERID = 'xxxxxxxxxxxxxxxxxxxxxxxx'; //set the userid of your bot here.
var ROOMID = 'xxxxxxxxxxxxxxxxxxxxxxxx'; //set the roomid of the room you want the bot to go to here.
var playLimit = 4; //set the playlimit here (default 4 songs)
var songLengthLimit = 10.0; //set song limit in minutes
var afkLimit = 20; //set the afk limit in minutes here
var roomafkLimit = 10; //set the afk limit for the audience here(in minutes), this feature is off by default
var howManyVotes = 5; //how many awesome's for a song to be automatically added to the bot's playlist(only works when autoSnag = true;)

//note that anything added to the script manually will have to be removed from the script manually
//all the values currently in these arrays are examples and can be removed.
global.bannedArtists = ['dj tiesto', 'skrillex', 'lil wayne', 't-pain', 'tpain', 'katy perry', 'eminem', 'porter robinson', //banned artist/ song list (MUST BE LOWERCASE)
'gorgoroth', 'justin bieber', 'deadmau5', 'rick roll', 'nosia', 'infected mushroom', 'never gonna give you up', 'rick astley', 'spongebob squarepants'];
global.bannedUsers = ['636473737373', 'bob', '535253533353', 'joe']; //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
global.bannedFromStage = ['636473737373', 'bob', '535253533353', 'joe']; //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)

global.vipList = [];
/* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
                        want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage.
                     */

//these variables set features to on or off as the default when the bot starts up,
//most of them can be changed with commands while the bot is running
// true = on, false = off
var HowManyVotesToSkip = 2; //how many votes for a song to get skipped(default value, only works if voteSkip = true)
var getonstage = true; //autodjing(on by default)
var queue = true; //queue(on by default)
var AFK = true; //afk limit(on by default), this is for the dj's on stage
var MESSAGE = true; //room message(on by default), the bot says your room info every 15 mins
var GREET = true; //room greeting when someone joins the room(on by default)
var voteSkip = false; //voteskipping(off by default)
var roomAFK = false; //audience afk limit(off by default)
var SONGSTATS = true; //song stats after each song(on by default)
var kickTTSTAT = false; //kicks the ttstats bot when it tries to join the room(off by default)
var LIMIT = true; //song length limit (on by default)
var PLAYLIMIT = false; //song play limit, this is for the playLimit variable up above(off by default)
var autoSnag = false; //auto song adding(different from every song adding), tied to howManyVotes up above, (off by default)


/************************************EndSetUp**********************************************************************/


var spamLimit = 3; //number of times a user can spam being kicked off the stage within 10 secs
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
var snagSong = false;
var checkWhoIsDj;
var randomOnce = 0;
var voteCountSkip = 0;
var votesLeft = HowManyVotesToSkip;
var djsOnStage = null;
var sayOnce = true;
var artist = null;
var getSong = null;
var informTimer = null;
var upVotes = null;
var downVotes = null;
var whoSnagged = 0;
var beginTime = null;
var endTime = null;
var roomName = null;
var ttRoomName = null;
var THEME = false;
var whatIsTheme = null;

global.timer = [];
global.greetingTimer = [];
global.djs20 = [];
global.people = [];
global.lastSeen = {};
global.lastSeen1 = {};
global.lastSeen2 = {};
global.lastSeen3 = {};
global.lastSeen4 = {};
global.afkPeople = [];
global.blackList = [];
global.stageList = [];
global.userIds = [];
global.checkVotes = [];
global.theUsersList = [];
global.modList = [];
global.escortList = [];
global.currentDjs = [];
global.queueList = [];
global.queueName = [];
global.myTime = [];
global.curSongWatchdog = null;
global.takedownTimer = null;
global.lastdj = null;
global.checkLast = null;
global.songLimitTimer = null;
global.beginTimer = null;

var randomPort = Math.ceil(Math.random() * 10000 + 6000);
var bot = new Bot(AUTH, USERID, ROOMID);
bot.listen(randomPort, '127.0.0.1');

//updates the afk list
justSaw = function (uid)
{
    return lastSeen[uid] = Date.now();
}

//updates the afk list
justSaw1 = function (uid)
{
    return lastSeen1[uid] = Date.now();
}


//updates the afk list
justSaw2 = function (uid)
{
    return lastSeen2[uid] = Date.now();
}

//these update the afk of everyone in the room
justSaw3 = function (uid)
{
    return lastSeen3[uid] = Date.now();
}

//these update the afk of everyone in the room
justSaw4 = function (uid)
{
    return lastSeen4[uid] = Date.now();
}


//checks if a person is afk or not
isAfk = function (userId, num)
{
    var last = lastSeen[userId];
    var age_ms = Date.now() - last;
    var age_m = Math.floor(age_ms / 1000 / 60);
    if (age_m >= num)
    {
        return true;
    }
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
    }
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
    }
    return false;
};

//checks if a person is afk or not
isAfk3 = function (userId, num)
{
    var last = lastSeen3[userId];
    var age_ms = Date.now() - last;
    var age_m = Math.floor(age_ms / 1000 / 60);
    if (age_m >= num)
    {
        return true;
    }
    return false;
};

//checks if a person is afk or not
isAfk4 = function (userId, num)
{
    var last = lastSeen4[userId];
    var age_ms = Date.now() - last;
    var age_m = Math.floor(age_ms / 1000 / 60);
    if (age_m >= num)
    {
        return true;
    }
    return false;
};

//removes afk dj's after afklimit is up.
afkCheck = function ()
{
    for (var i = 0; i < currentDjs.length; i++)
    {
        afker = currentDjs[i]; //Pick a DJ
        var isAfkMod = modList.indexOf(afker);
        var whatIsAfkerName = theUsersList.indexOf(afker) + 1;
        if ((isAfk1(afker, (afkLimit - 5))) && AFK === true)
        {
            if (afker != USERID && isAfkMod === -1)
            {
                bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                justSaw1(afker);
            }
        }
        if ((isAfk2(afker, (afkLimit - 1))) && AFK === true)
        {
            if (afker != USERID && isAfkMod == -1)
            {
                bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                justSaw2(afker);
            }
        }
        if ((isAfk(afker, afkLimit)) && AFK === true)
        { //if Dj is afk then	   
            if (afker != USERID && isAfkMod == -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
            {
                if (afker != checkWhoIsDj)
                {
                    bot.speak('@' + theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + afkLimit + ' minutes.');
                    justSaw1(afker);
                    justSaw2(afker);
                    justSaw(afker);
                    bot.remDj(afker); //remove them	
                }
            }
        }
    }
};
setInterval(afkCheck, 5000); //This repeats the check every five seconds.



//this removes people on the floor, not the djs
roomAfkCheck = function ()
{
    for (var i = 0; i < userIds.length; i++)
    {

        var afker2 = userIds[i]; //Pick a DJ
        var isAfkMod = modList.indexOf(afker2);
        var isDj = currentDjs.indexOf(afker2);
        if ((isAfk3(afker2, (roomafkLimit - 1))) && roomAFK === true)
        {

            if (afker2 != USERID && isDj == -1 && isAfkMod == -1)
            {
                bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                justSaw3(afker2);
            }
        }
        if ((isAfk4(afker2, roomafkLimit)) && roomAFK === true)
        { //if person is afk then	   
            if (afker2 != USERID && isAfkMod == -1) //checks to see if afker is a mod or a bot or a dj, if they are is does not kick them.
            {
                if (isDj == -1)
                {
                    bot.pm('you are over the afk limit of ' + roomafkLimit + ' minutes.', afker2);
                    bot.boot(afker2, 'you are over the afk limit');
                    justSaw3(afker2);
                    justSaw4(afker2);
                }
            }
        }
    }
};

setInterval(roomAfkCheck, 5000) //This repeats the check every five seconds.



queueCheck15 = function ()
{
    //if queue is turned on once someone leaves the stage the first person
    //in line has 60 seconds to get on stage before being remove from the queue
    if (queue === true && queueList.length !== 0)
    {
        if (sayOnce === true && djsOnStage < 5)
        {
            sayOnce = false;
            bot.speak('@' + queueName[0] + ' you have 30 seconds to get on stage.');
            beginTimer = setTimeout(function ()
            {
                queueList.splice(0, 2);
                queueName.splice(0, 1);
                sayOnce = true;
            }, 30 * 1000);
        }
    }
}

setInterval(queueCheck15, 5000) //repeats the check every five seconds. 



vipListCheck = function ()
{
    //this kicks all users off stage when the vip list is not empty
    if (vipList.length !== 0 && djsOnStage.length != vipList.length)
    {
        for (var p = 0; p < currentDjs.length; p++)
        {
            var checkIfVip = vipList.indexOf(currentDjs[p]);
            if (checkIfVip == -1 && currentDjs[p] != USERID)
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
    if (MESSAGE === true && detail !== undefined)
    {
        bot.speak('Welcome to ' + roomName + ', the rules are simple, ' + detail); //set the message you wish the bot to repeat here i.e rules and such.
    }
};

setInterval(repeatMessage, 900 * 1000) //repeats this message every 15 mins if /messageOn has been used.





bot.on('newsong', function (data)
{
    var length = data.room.metadata.current_song.metadata.length;

    //this is for the /inform command
    if (informTimer !== null)
    {
        clearTimeout(informTimer);
        informTimer = null;
        bot.speak("@" + theUsersList[checkLast + 1] + ", Thanks buddy ;-)");
    }




    //this is for the song length limit
    if (songLimitTimer !== null)
    {
        clearTimeout(songLimitTimer);
        songLimitTimer = null;
        bot.speak("@" + theUsersList[checkLast + 1] + ", Thanks buddy ;-)");
    }



    // If watch dog has been previously set, 
    // clear since we've made it to the next song
    if (curSongWatchdog !== null)
    {
        clearTimeout(curSongWatchdog);
        curSongWatchdog = null;
    }



    // If takedown Timer has been set, 
    // clear since we've made it to the next song
    if (takedownTimer !== null)
    {
        clearTimeout(takedownTimer);
        takedownTimer = null;
        bot.speak("@" + theUsersList[checkLast + 1] + ", Thanks buddy ;-)");
    }



    // Set this after processing things from last timer calls
    lastdj = data.room.metadata.current_dj;
    checkLast = theUsersList.indexOf(lastdj);
    var modIndex = modList.indexOf(lastdj);




    // Set a new watchdog timer for the current song.

    curSongWatchdog = setTimeout(function ()
    {
        curSongWatchdog = null;
        bot.speak("@" + theUsersList[checkLast + 1] + ", you have 20 seconds to skip your stuck song before you are removed");
        //START THE 20 SEC TIMER
        takedownTimer = setTimeout(function ()
        {
            takedownTimer = null;
            bot.remDj(lastdj); // Remove Saved DJ from last newsong call
        }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
    }, (length + 10) * 1000); // Timer expires 10 seconds after the end of the song, if not cleared by a newsong



    //this boots the user if their song is over the length limit
    if ((length / 60) >= songLengthLimit)
    {
        if (lastdj == USERID || modIndex == -1)
        {
            if (LIMIT === true)
            {
                bot.speak("@" + theUsersList[checkLast + 1] + ", your song is over " + songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
                //START THE 20 SEC TIMER
                songLimitTimer = setTimeout(function ()
                {
                    songLimitTimer = null;
                    bot.remDj(lastdj); // Remove Saved DJ from last newsong call
                }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
            }
        }
    }

});





//checks at the beggining of the song
bot.on('newsong', function (data)
{

    //resets counters and array for vote skipping
    checkVotes = [];
    voteCountSkip = 0;
    votesLeft = HowManyVotesToSkip;
    whoSnagged = 0;
    upVotes = 0;
    downVotes = 0;


    //procedure for getting song tags
    song = data.room.metadata.current_song.metadata.song;
    album = data.room.metadata.current_song.metadata.album;
    genre = data.room.metadata.current_song.metadata.genre;
    artist = data.room.metadata.current_song.metadata.artist;
    getSong = data.room.metadata.current_song._id;


    //adds a song to the end of your bots queue
    if (snagSong === true)
    {
        bot.playlistAll(function (playlist)
        {
            bot.playlistAdd(getSong, playlist.list.length);
        });
    }


    var userId = USERID; // the bots userid


    //used to check who the currently playing dj is.
    checkWhoIsDj = data.room.metadata.current_dj;


    //used to get current dj's name.
    dj = data.room.metadata.current_song.djname;
    bot.bop(); //automatically awesomes each song. will not awesome again until the next song.


    //used to have the bot skip its song if its the current player (if it has any)
    if (userId == checkWhoIsDj && skipOn === true)
    {
        bot.skip();
    }


    //puts bot on stage if there is one dj on stage, and removes them when there is 5 dj's on stage.
    current = data.room.metadata.djcount;
    if (current >= 1 && current <= 3 && queueList.length === 0)
    {
        if (getonstage === true && vipList.length === 0)
        {
            bot.addDj();
        }
    }
    if (current == 5 && getonstage === true)
    {
        bot.remDj();
    }
    //if the bot is the only one on stage and they are skipping their songs
    //they will stop skipping
    if (current == 1 && checkWhoIsDj == USERID && skipOn === true)
    {
        skipOn = false;
    }


    var checkIfAdmin = modList.indexOf(checkWhoIsDj);
    //removes current dj from stage if they play a banned song or artist.
    if (bannedArtists.length !== 0)
    {
        for (var j = 0; j < bannedArtists.length; j++)
        {
            if (artist.toLowerCase().match(bannedArtists[j]) || song.toLowerCase().match(bannedArtists[j]))
            {
                if (checkIfAdmin == -1 || checkWhoIsDj == USERID)
                {
                    var nameDj = theUsersList.indexOf(checkWhoIsDj) + 1;
                    bot.remDj(checkWhoIsDj);
                    bot.speak('@' + theUsersList[nameDj] + ' you have played a banned track or artist.');
                    break;
                }
            }
        }
    }
});



//bot gets on stage and starts djing if no song is playing.
bot.on('nosong', function (data)
{
    if (getonstage === true && vipList.length === 0)
    {
        bot.addDj();
    }
    skipOn = false;
})




//checks when the bot speaks
bot.on('speak', function (data)
{
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
    if (AFK === true || roomAFK === true)
    {
        justSaw(data.userid);
        justSaw1(data.userid);
        justSaw2(data.userid);
        justSaw3(data.userid);
        justSaw4(data.userid);
    }





    if (text.match(/^\/autodj$/) && condition === true)
    {
        if (current < 5)
        {
            bot.addDj();
        }
        else if (current != null && current >= 5)
        {
            bot.pm('error, the stage is full', data.userid);
        }
    }
    else if (text.match(/^\/modpm/) && condition === true)
    {
        var speak = text.substring(7);
        for (var g = 0; g < modList.length; g++)
        {
            var isModInRoom = theUsersList.indexOf(modList[g]);
            if (isModInRoom != -1)
            {
                bot.pm(name + ' said: ' + speak, modList[g]);
            }

        }
    }
    else if (text.match(/^\/playlist/))
    {
        bot.playlistAll(function (playlist)
        {
            bot.speak('There are currently ' + playlist.list.length + ' songs in my playlist.');
        });
    }
    else if (text.match(/^\/randomSong$/) && condition === true)
    {
        if (randomOnce != 1)
        {
            bot.playlistAll(function (playlist)
            {
                var ez = 0;
                bot.speak("Reorder initiated.");
                ++randomOnce;
                var reorder = setInterval(function ()
                {
                    if (ez <= playlist.list.length)
                    {
                        var nextId = Math.ceil(Math.random() * playlist.list.length);
                        bot.playlistReorder(ez, nextId);
                        console.log("Song " + ez + " changed.");
                        ez++;
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
        else
        {
            bot.pm('error, playlist reordering is already in progress', data.userid);
        }
    }
    else if (text.match('turntable.fm/') && !text.match('turntable.fm/' + ttRoomName) && modIndex == -1 && data.userid != USERID)
    {
        bot.boot(data.userid, 'do not advertise other rooms here');
    }
    else if (text.match('/bumptop') && condition === true)
    {
        if (queue === true)
        {
            var topOfQueue = data.text.slice(10);
            var index35 = queueList.indexOf(topOfQueue);
            var index46 = queueName.indexOf(topOfQueue);
            var index80 = theUsersList.indexOf(topOfQueue);
            var index81 = theUsersList[index80];
            var index82 = theUsersList[index80 - 1];
            if (index35 != -1 && index80 != -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                queueList.splice(index35, 2);
                queueList.unshift(index81, index82);
                queueName.splice(index46, 1);
                queueName.unshift(index81);
                var temp92 = 'The queue is now: ';
                for (var po = 0; po < queueName.length; po++)
                {
                    if (po != (queueName.length - 1))
                    {
                        temp92 += queueName[po] + ', ';
                    }
                    else if (po == (queueName.length - 1))
                    {
                        temp92 += queueName[po];
                    }
                }
                bot.speak(temp92);

            }
        }
    }
    else if (text.match(/^\/stalk/) && condition === true)
    {
        var stalker = text.substring(7);
        bot.stalk(stalker, allInformations = true, function (data4)
        {
            if (data4.success !== false)
            {
                bot.speak('User found in room: http://turntable.fm/' + data4.room.shortcut);
            }
            else
            {
                bot.speak('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist');
            }
        });
    }
    else if (text.match(/^\/position/))
    {
        var checkPosition = queueName.indexOf(data.name);

        if (checkPosition != -1 && queue === true) //if person is in the queue and queue is active
        {
            bot.speak('@' + name + ' you are currently in position number ' + (checkPosition + 1) + ' in the queue');
        }
        else if (checkPosition == -1 && queue === true)
        {
            bot.speak('@' + name + ' i can\'t tell you your position unless you are currently in the queue');
        }
        else
        {
            bot.speak('@' + name + ' there is currently no queue');
        }
    }
    else if (text.match(/^\/lengthLimit/) && condition === true)
    {
        if (LIMIT === true)
        {
            LIMIT = false;
            bot.speak('the song length limit is now inactive');
        }
        else
        {
            LIMIT = true;
            bot.speak('the song length limit is now active');
        }
    }
    else if (text.match(/^\/botstatus/) && condition === true)
    {
        var whatsOn = '';

        if (queue === true)
        {
            whatsOn += 'queue: On, ';
        }
        else
        {
            whatsOn += 'queue: Off, ';
        }
        if (AFK === true)
        {
            whatsOn += 'dj afk limit: On, ';
        }
        else
        {
            whatsOn += 'dj afk limit: Off, ';
        }
        if (getonstage === true)
        {
            whatsOn += 'autodjing: On, ';
        }
        else
        {
            whatsOn += 'autodjing: Off, ';
        }
        if (MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (PLAYLIMIT === true)
        {
            whatsOn += 'song play limit: On, ';
        }
        else
        {
            whatsOn += 'song play limit: Off, ';
        }
        if (skipOn === true)
        {
            whatsOn += 'autoskipping: On, ';
        }
        else
        {
            whatsOn += 'autoskipping: Off, ';
        }
        if (snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (autoSnag === true)
        {
            whatsOn += 'vote based song adding: On, ';
        }
        else
        {
            whatsOn += 'vote based song adding: Off, ';
        }
        if (randomOnce === 0)
        {
            whatsOn += 'playlist reordering in progress?: No';
        }
        else
        {
            whatsOn += 'playlist reordering in progress?: Yes';
        }

        bot.speak(whatsOn);
    }
    else if (text.match(/^\/voteskipon/) && condition === true)
    {
        checkVotes = [];
        HowManyVotesToSkip = Number(data.text.slice(12))
        if (isNaN(HowManyVotesToSkip) || HowManyVotesToSkip === 0)
        {
            bot.speak("error, please enter a valid number");
        }

        if (!isNaN(HowManyVotesToSkip) && HowManyVotesToSkip !== 0)
        {
            bot.speak("vote skipping is now active, current votes needed to pass " + "the vote is " + HowManyVotesToSkip);
            voteSkip = true;
            voteCountSkip = 0;
            votesLeft = HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/noTheme/) && condition === true)
    {
        THEME = false;
        bot.speak('The theme is now inactive');
    }
    else if (text.match(/^\/setTheme/) && condition === true)
    {
        whatIsTheme = data.text.slice(10);
        THEME = true;
        bot.speak('The theme is now set to: ' + whatIsTheme);
    }
    else if (text.match(/^\/theme/))
    {
        if (THEME === false)
        {
            bot.speak('There is currently no theme, standard rules apply');
        }
        else
        {
            bot.speak('The theme is currently set to: ' + whatIsTheme);
        }
    }
    else if (text.match(/^\/voteskipoff$/) && condition === true)
    {
        bot.speak("vote skipping is now inactive");
        voteSkip = false;
        voteCountSkip = 0;
        votesLeft = HowManyVotesToSkip;
    }
    else if (text.match(/^\/skip$/) && voteSkip === true)
    {
        var takeBotOff = modList.indexOf(USERID);
        var checkIfOnList = checkVotes.indexOf(data.userid)
        var checkIfMod = modList.indexOf(lastdj);
        if (takeBotOff != -1)
        {
            modList.splice(takeBotOff, 1);
        }
        if (checkIfOnList == -1 && data.userid != USERID)
        {
            voteCountSkip += 1;
            votesLeft -= 1;
            checkVotes.unshift(data.userid);

            var findLastDj = theUsersList.indexOf(lastdj);
            if (votesLeft !== 0 && checkIfMod == -1)
            {				
                bot.speak("Current Votes for a song skip: " + voteCountSkip +
                    " Votes needed to skip the song: " + HowManyVotesToSkip);
            }			
            if (votesLeft === 0 && checkIfMod == -1 && !isNaN(HowManyVotesToSkip))
            {
                bot.speak("@" + theUsersList[findLastDj + 1] + " you have been voted off stage");
                bot.remDj(lastdj);
            }
        }
    }
    else if (text.match(/^\/afkon/) && condition === true)
    {
        AFK = true;
        bot.speak('the afk list is now active.');
        for (var z = 0; z < currentDjs.length; z++)
        {
            justSaw(currentDjs[z]);
            justSaw1(currentDjs[z]);
            justSaw2(currentDjs[z]);
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true)
    {
        AFK = false;
        bot.speak('the afk list is now inactive.');
    }
    else if (text.match(/^\/roomafkon/) && condition === true)
    {
        roomAFK = true;
        bot.speak('the audience afk list is now active.');
        for (var zh = 0; zh < userIds.length; zh++)
        {
            var isDj2 = currentDjs.indexOf(userIds[zh])
            if (isDj2 == -1)
            {
                justSaw3(userIds[zh]);
                justSaw4(userIds[zh]);
            }
        }
    }
    else if (text.match(/^\/roomafkoff/) && condition === true)
    {
        roomAFK = false;
        bot.speak('the audience afk list is now inactive.');
    }
    else if (text.match(/^\/smoke/))
    {
        bot.speak('smoke em\' if ya got em.');
    }
    else if (text.match(/^\/moon/))
    {
        bot.speak('@' + name + ' is going to the moon!');
    }
    else if (text.match(/^\/djplays/))
    {
        if (currentDjs.length !== 0)
        {
            var djsnames = [];
            var djplays = 'dj plays: ';
            for (var i = 0; i < currentDjs.length; i++)
            {
                var djname = theUsersList.indexOf(currentDjs[i]) + 1;
                djsnames.push(theUsersList[djname]);
                if (currentDjs[i] != currentDjs[(currentDjs.length - 1)])
                {
                    djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong + ', ';
                }
                else
                {
                    djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong;
                }
            }
            bot.speak(djplays);
        }
        else if (currentDjs.length === 0)
        {
            bot.speak('There are no dj\'s on stage.');
        }
    }
    else if (text.match(/^\/skipsong/) && condition === true)
    {
        if (checkWhoIsDj == USERID)
        {
            bot.skip();
        }
        else
        {
            bot.pm('error, that command only skips the bots currently playing song', data.userid);
        }
    }
    else if (text.match(/^\/mytime/))
    {
        var msecPerMinute1 = 1000 * 60;
        var msecPerHour1 = msecPerMinute1 * 60;
        var msecPerDay1 = msecPerHour1 * 24;
        var endTime1 = Date.now();
        var currentTime1 = endTime1 - myTime[data.userid];

        var days1 = Math.floor(currentTime1 / msecPerDay1);
        currentTime1 = currentTime1 - (days1 * msecPerDay1);

        var hours1 = Math.floor(currentTime1 / msecPerHour1);
        currentTime1 = currentTime1 - (hours1 * msecPerHour1);

        var minutes1 = Math.floor(currentTime1 / msecPerMinute1);

        bot.getProfile(data.userid, function (data6)
        {
            bot.speak('@' + data6.name + ' you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes');
        });
    }
    else if (text.match(/^\/uptime/))
    {
        var msecPerMinute = 1000 * 60;
        var msecPerHour = msecPerMinute * 60;
        var msecPerDay = msecPerHour * 24;
        endTime = Date.now();
        var currentTime = endTime - beginTime;

        var days = Math.floor(currentTime / msecPerDay);
        currentTime = currentTime - (days * msecPerDay);

        var hours = Math.floor(currentTime / msecPerHour);
        currentTime = currentTime - (hours * msecPerHour);

        var minutes = Math.floor(currentTime / msecPerMinute);

        bot.speak('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes');
    }
    else if (text.match(/^\/songstats/) && condition === true)
    {
        if (SONGSTATS === true)
        {
            SONGSTATS = false;
            bot.speak('song stats is now inactive');
        }
        else if (SONGSTATS === false)
        {
            SONGSTATS = true;
            bot.speak('song stats is now active');
        }
    }
    else if (text.match(/^\/props/))
    {
        bot.speak('@' + name + ' gives ' + '@' + dj + ' an epic high :hand:');
    }
    else if (text.match(/^\/greeton/) && condition === true)
    {
        bot.speak('room greeting: On');
        GREET = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true)
    {
        bot.speak('room greeting: Off');
        GREET = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true)
    {
        bot.speak('message: On');
        MESSAGE = true;
    }
    else if (text.match(/^\/messageOff/) && condition === true)
    {
        bot.speak('message: Off');
        MESSAGE = false;
    }
    else if (text.match(/^\/pmcommands/))
    {
        bot.pm('that command only works in the pm', data.userid);
    }
    else if (text.match(/^\/commands/))
    {
        bot.speak('the commands are  /awesome, ' +
            ' /mom, /chilly, /cheers, /fanratio @, /theme, /mytime, /playlist, /position, /afk, /whosafk, /coinflip, /moon, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, ' +
            '/skip, /dive, /dance, /smoke, /surf, /uptime, /djplays, /admincommands, /queuecommands, /pmcommands');
    }
    else if (text.match(/^\/queuecommands/))
    {
        bot.speak('the commands are /queue, /removefromqueue, /removeme, /addme, /queueOn, /queueOff, /bumptop');
    }
    else if (text.match(/^\/admincommands/) && condition === true)
    {
        bot.speak('the mod commands are /ban @, /unban @, /skipon, /snagevery, /autosnag, /botstatus, /skipoff, /noTheme, /lengthLimit, /stalk, /setTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
            '/snag, /removesong, /playLimitOn, /playLimitOff, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, /whobanned, ' +
            '/whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm');
        condition = false;
    }
    else if (text.match(/^\/tableflip/))
    {
        bot.speak('/tablefix');
    }
    else if (text.match('/awesome'))
    {
        bot.vote('up');
    }
    else if (text.match('/lame') && condition === true)
    {
        bot.vote('down');
    }
    else if (text.match(/^\/removedj$/) && condition === true)
    {
        bot.remDj();
    }
    else if (text.match(/^\/inform$/) && condition === true)
    {
        if (informTimer === null)
        {
            var checkDjsName = theUsersList.indexOf(lastdj) + 1;
            bot.speak('@' + theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
            informTimer = setTimeout(function ()
            {
                bot.pm('you took too long to skip your song', lastdj);
                bot.remDj(lastdj);
                informTimer = null;
            }, 20 * 1000);
        }
    }
    else if (text.match('/cheers'))
    {
        bot.speak('@' + name + ' raises their glass for a toast');
    }
    else if (text.match(/^\/mom$/))
    {
        var x = Math.floor(Math.random() * 4);
        switch (x)
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
    else if (text.match('/coinflip'))
    {
        var y = Math.floor(Math.random() * 2 + 1);
        switch (y)
        {
            case 1:
                bot.speak('@' + name + ' i am flipping a coin... you got... heads');
                break;
            case 2:
                bot.speak('@' + name + ' i am flipping a coin... you got... tails');
                break;
        }
    }
    else if (text.match(/^\/dance$/))
    {
        bot.speak('http://www.gifbin.com/f/986269');
    }
    else if (text.match(/^\/chilly$/))
    {
        bot.speak('@' + name + ' is pleasantly chilled.');
    }
    else if (text.match(/^\/skipon$/) && condition === true)
    {
        bot.speak('i am now skipping my songs');
        skipOn = true;
    }
    else if (text.match(/^\/skipoff$/) && condition === true)
    {
        bot.speak('i am no longer skipping my songs');
        skipOn = false;
    }
    else if (text.match(/^\/fanratio/)) //this one courtesy of JenTheInstigator of turntable.fm
    {
        var tmpuser = data.text.substring(11);
        bot.getUserId(tmpuser, function (data1)
        {
            var tmpid = data1.userid;
            bot.getProfile(tmpid, function (data2)
            {
                if (typeof (data1.userid) !== 'undefined')
                {
                    var tmp = tmpuser + " has " + data2.points + " points and " + data2.fans + " fans, for a ratio of " + Math.round(data2.points / data2.fans) + ".";
                    bot.speak(tmp);
                }
                else
                {
                    bot.speak('I\m sorry I don\'t know that one');
                }
            });
        });
    }
    else if (text.match(/^\/getonstage$/) && condition === true)
    {
        if (getonstage === false)
        {
            bot.speak('I am now auto djing');
            getonstage = true;
        }
        else if (getonstage === true)
        {
            bot.speak('I am no longer auto djing');
            getonstage = false;
        }
    }
    else if (text.match('/beer'))
    {
        var botname = theUsersList.indexOf(USERID) + 1;
        bot.speak('@' + theUsersList[botname] + ' hands ' + '@' + name + ' a nice cold :beer:');
    }
    else if (data.text == '/escortme')
    {
        var djListIndex = currentDjs.indexOf(data.userid);
        var escortmeIndex = escortList.indexOf(data.userid);
        if (djListIndex != -1 && escortmeIndex == -1)
        {
            escortList.push(data.userid);
            bot.speak('@' + name + ' you will be escorted after you play your song');
        }
    }
    else if (data.text == '/stopescortme')
    {
        bot.speak('@' + name + ' you will no longer be escorted after you play your song');
        var escortIndex = escortList.indexOf(data.userid);
        if (escortIndex != -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text == '/roominfo')
    {
        if (detail !== undefined)
        {
            bot.speak(detail);
        }
    }
    else if (data.text == '/fanme')
    {
        bot.speak('@' + name + ' i am now your fan!');
        myId = data.userid;
        bot.becomeFan(myId);
    }
    else if (data.text == '/getTags')
    {
        bot.speak('artist name: ' + artist + ', song name: ' + song + ', album: ' + album + ', genre: ' + genre);
    }
    else if (data.text == '/dice')
    {
        var random = Math.floor(Math.random() * 12 + 1);
        bot.speak('@' + name + ' i am rolling the dice... your number is... ' + random);
    }
    else if (text.match(/^\/dive/))
    {
        var checkDj = currentDjs.indexOf(data.userid);
        if (checkDj != -1)
        {
            bot.remDj(data.userid);
        }
        else
        {
            bot.pm('you must be on stage to use that command.', data.userid);
        }
    }
    else if (text.match('/surf'))
    {
        bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
    }
    else if (data.text == '/unfanme')
    {
        bot.speak('@' + name + ' i am no longer your fan.');
        myId = data.userid;
        bot.removeFan(myId);
    }
    else if (text.match(/^\/m/) && !text.match(/^\/me/) && condition === true)
    {
        bot.speak(text.substring(3));
    }
    else if (text.match(/^\/hello$/))
    {
        bot.speak('Hey! How are you @' + name + '?');
    }
    else if (text.match(/^\/snagevery$/) && condition === true)
    {
        if (snagSong === true)
        {
            snagSong = false;
            bot.speak('I am no longer adding every song that plays');
        }
        else if (snagSong === false)
        {
            snagSong = true; //this is for /snagevery
            autoSnag = false; //this turns off /autosnag
            bot.speak('I am now adding every song that plays, /autosnag has been turned off');
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true)
    {
        if (autoSnag === false)
        {
            autoSnag = true; //this is for /autosnag
            snagSong = false; //this is for /snagevery			
            bot.speak('I am now adding every song that gets at least (' + howManyVotes + ') awesome\'s, /snagevery has been turned off');
        }
        else if (autoSnag === true)
        {
            autoSnag = false;
            bot.speak('vote snagging has been turned off');
        }
    }
    else if (text.match(/^\/snag/) && condition === true)
    {
        if (getSong !== null)
        {
            bot.playlistAll(function (playlist)
            {
                var found = false;
                for (var igh = 0; igh < playlist.list.length; igh++)
                {
                    if (playlist.list[igh]._id == getSong)
                    {
                        found = true;
                        bot.speak('I already have that song');
                    }
                }
                if (!found)
                {
                    bot.playlistAdd(getSong, playlist.list.length);
                    bot.speak('song added');
                }
            });
        }
        else
        {
            bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.userid);
        }
    }
    else if (text.match(/^\/removesong$/) && condition === true)
    {
        bot.playlistAll(function (playlist)
        {
            if (checkWhoIsDj == USERID)
            {
                var remove = playlist.list.length - 1;
                bot.skip();
                bot.playlistRemove(remove);
                bot.speak('the last snagged song has been removed.');
            }
            else
            {
                var remove2 = playlist.list.length - 1;
                bot.playlistRemove(remove2);
                bot.speak('the last snagged song has been removed.');
            }
        })
    }
    else if (text.match(/^\/queue$/))
    {
        if (queue === true && queueName.length !== 0)
        {
            var temp95 = 'The queue is now: ';
            for (var kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl];
                }
            }
            bot.speak(temp95);

        }
        else if (queue === true)
        {
            bot.speak('The queue is currently empty.');
        }
        else
        {
            bot.speak('There is currently no queue.');
        }
    }
    else if (text.match(/^\/whobanned$/) && condition === true)
    {
        if (blackList.length !== 0)
        {
            bot.speak('ban list: ' + blackList);
        }
        else
        {
            bot.speak('The ban list is empty.');
        }
    }
    else if (text.match(/^\/whostagebanned$/) && condition === true)
    {
        if (stageList.length !== 0)
        {
            bot.speak('banned from stage: ' + stageList);
        }
        else
        {
            bot.speak('The banned from stage list is currently empty.');
        }
    }
    else if (text.match('/removefromqueue') && queue === true)
    {
        if (condition === true)
        {
            var removeFromQueue = data.text.slice(18);
            var index5 = queueList.indexOf(removeFromQueue);
            var index6 = queueName.indexOf(removeFromQueue);
            if (index5 != -1)
            {
                if (queueName[index6] == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueList.splice(index5, 2);
                queueName.splice(index6, 1);

                if (queueName.length !== 0)
                {
                    var temp89 = 'The queue is now: ';
                    for (var jk = 0; jk < queueName.length; jk++)
                    {
                        if (jk != (queueName.length - 1))
                        {
                            temp89 += queueName[jk] + ', ';
                        }
                        else if (jk == (queueName.length - 1))
                        {
                            temp89 += queueName[jk];
                        }
                    }
                    bot.speak(temp89);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, no such person was found to be in the queue', data.userid);
            }
        }
    }
    else if (text.match(/^\/removeme$/) && queue === true)
    {
        var list1 = queueList.indexOf(data.name);
        if (list1 != -1)
        {
            queueList.splice(list1, 2);
        }
        var list2 = queueName.indexOf(data.name);
        if (list2 != -1)
        {
            if (data.name == queueName[0])
            {
                clearTimeout(beginTimer);
                sayOnce = true;
            }
            queueName.splice(list2, 1);
            if (queueName.length !== 0)
            {
                var temp90 = 'The queue is now: ';
                for (var kj = 0; kj < queueName.length; kj++)
                {
                    if (kj != (queueName.length - 1))
                    {
                        temp90 += queueName[kj] + ', ';
                    }
                    else if (kj == (queueName.length - 1))
                    {
                        temp90 += queueName[kj];
                    }
                }
                bot.speak(temp90);
            }
            else
            {
                bot.speak('The queue is now empty.');
            }
        }
        else
        {
            bot.pm('error, you have to be in the queue to remove yourself from the queue', data.userid);
        }
    }
    else if (text.match(/^\/addme$/) && queue === true)
    {
        var list3 = queueList.indexOf(data.name);
        var list10 = currentDjs.indexOf(data.userid)
        var checkStageList = stageList.indexOf(data.userid);
        if (list3 == -1 && list10 == -1 && checkStageList == -1)
        {
            queueList.push(data.name, data.userid);
            queueName.push(data.name);
            var temp91 = 'The queue is now: ';
            for (var hj = 0; hj < queueName.length; hj++)
            {
                if (hj != (queueName.length - 1))
                {
                    temp91 += queueName[hj] + ', ';
                }
                else if (hj == (queueName.length - 1))
                {
                    temp91 += queueName[hj];
                }
            }
            bot.speak(temp91);

        }
    }
    else if (text.match(/^\/queueOn$/) && condition === true)
    {
        queueList = [];
        queueName = [];
        bot.speak('the queue is now active.');
        queue = true;
    }
    else if (text.match(/^\/playLimitOn$/) && condition === true)
    {
        PLAYLIMIT = true;
        bot.speak('the play limit is now active, dj song counters have been reset.');
        for (var ig = 0; ig < currentDjs.length; ig++)
        {
            djs20[currentDjs[ig]] = {
                nbSong: 0
            };
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true)
    {
        PLAYLIMIT = false;
        bot.speak('the play limit is now inactive.');
    }
    else if (text.match('/surf'))
    {
        bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
    }
    else if (text.match(/^\/queueOff$/) && condition === true)
    {
        bot.speak('the queue is now inactive.');
        queue = false;
    }
    else if (text.match('/banstage') && condition === true)
    {
        var ban = data.text.slice(11);
        var checkBan = stageList.indexOf(ban);
        var checkUser = theUsersList.indexOf(ban);
        if (checkBan == -1 && checkUser != -1)
        {
            stageList.push(theUsersList[checkUser - 1], theUsersList[checkUser]);
            bot.remDj(theUsersList[checkUser - 1]);
            condition = false;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/unbanstage') && condition === true)
    {
        var ban2 = data.text.slice(13);
        index = stageList.indexOf(ban2);
        if (index != -1)
        {
            stageList.splice(stageList[index - 1], 2);
            condition = false;
            index = null;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/ban') && condition === true)
    {
        var ban3 = data.text.slice(6);
        var checkBan5 = blackList.indexOf(ban3);
        var checkUser3 = theUsersList.indexOf(ban3);
        if (checkBan5 == -1 && checkUser3 != -1)
        {
            blackList.push(theUsersList[checkUser3 - 1], theUsersList[checkUser3]);
            bot.boot(theUsersList[checkUser3 - 1]);
            condition = false;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/unban') && condition === true)
    {
        var ban6 = data.text.slice(8);
        index = blackList.indexOf(ban6);
        if (index != -1)
        {
            blackList.splice(blackList[index - 1], 2);
            condition = false;
            index = null;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/userid') && condition === true)
    {
        var ban8 = data.text.slice(9);
        var checkUser8 = bot.getUserId(ban8, function (data)
        {
            var userid56 = data.userid;
            if (typeof (userid56) !== 'undefined')
            {
                bot.speak(userid56);
                condition = false;
            }
            else
            {
                bot.speak('I\'m sorry that userid is undefined');
            }
        });
    }
    else if (text.match('/username') && condition === true)
    {
        var ban50 = data.text.slice(10);
        var tmp94 = bot.getProfile(ban50, function (data)
        {
            bot.speak(data.name);
        });
    }
    else if (text.match(/^\/afk/))
    {
        var isAlreadyAfk = afkPeople.indexOf(data.name);
        if (isAlreadyAfk == -1)
        {
            bot.speak('@' + name + ' you are marked as afk');
            afkPeople.push(data.name);
        }
        else if (isAlreadyAfk != -1)
        {
            bot.speak('@' + name + ' you are no longer afk');
            afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text.match(/^\/whosafk/))
    {
        if (afkPeople.length !== 0)
        {
            var whosAfk = 'marked as afk: ';
            for (var f = 0; f < afkPeople.length; f++)
            {
                if (f != (afkPeople.length - 1))
                {
                    whosAfk = whosAfk + afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + afkPeople[f];
                }
            }
            bot.speak(whosAfk);
        }
        else
        {
            bot.speak('No one is currently marked as afk');
        }
    }

    //checks to see if someone is trying to speak to an afk person or not.	
    if (afkPeople.length !== 0 && data.userid != USERID)
    {
        for (var j = 0; j < afkPeople.length; j++)
        {
            if (data.text.match(afkPeople[j]))
            {
                bot.speak(afkPeople[j] + ' is afk');
            }
        }
    }
});


//checks who voted and updates their position on the afk list.
bot.on('update_votes', function (data)
{
    if (AFK === true || roomAFK === true)
    {
        justSaw(data.room.metadata.votelog[0][0]);
        justSaw1(data.room.metadata.votelog[0][0]);
        justSaw2(data.room.metadata.votelog[0][0]);
        justSaw3(data.room.metadata.votelog[0][0]);
        justSaw4(data.room.metadata.votelog[0][0]);
    }


    //this is for keeping track of the upvotes and downvotes on the bot
    upVotes = data.room.metadata.upvotes;
    downVotes = data.room.metadata.downvotes;


    //this is for /autosnag, automatically adds songs that get over the awesome threshold
    //thanks to alain gilbert for playlist pre - testing, snag animation only when song not
    //already in playlist
    if (autoSnag === true && snagSong === false && upVotes >= howManyVotes)
    {
        bot.playlistAll(function (playlist)
        {
            var found = false;
            for (var i = 0; i < playlist.list.length; i++)
            {
                if (playlist.list[i]._id == getSong)
                {
                    found = true;
                }
            }
            if (!found && getSong != null)
            {
                bot.playlistAdd(getSong, playlist.list.length);
                bot.snag();
            }
        });
    }
})


//checks who added a song and updates their position on the afk list. 
bot.on('snagged', function (data)
{
    if (AFK === true || roomAFK === true)
    {
        justSaw(data.userid);
        justSaw1(data.userid);
        justSaw2(data.userid);
        justSaw3(data.userid);
        justSaw4(data.userid);
    }

    whoSnagged += 1;
})




//checks when a dj leaves the stage
bot.on('rem_dj', function (data)
{
    //removes one from dj count
    djsOnStage -= 1;


    //removes user from the dj list when they leave the stage
    delete djs20[data.user[0].userid];



    //updates the current dj's list.
    var check30 = currentDjs.indexOf(data.user[0].userid);
    currentDjs.splice(check30, 1);



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
bot.on('add_dj', function (data)
{

    //removes dj when they try to join the stage if the vip list has members in it.
    //does not remove the bot
    var checkVip = vipList.indexOf(data.user[0].userid);
    if (vipList.length !== 0 && checkVip == -1 && data.user[0].userid != USERID)
    {
        bot.remDj(data.user[0].userid);
        bot.pm('The vip list is currently active, only the vips may dj at this time', data.user[0].userid);
        ++people[data.user[0].userid].spamCount;
        if (timer[data.user[0].userid] !== null)
        {
            clearTimeout(timer[data.user[0].userid]);
            timer[data.user[0].userid] = null;
        }
        timer[data.user[0].userid] = setTimeout(function ()
        {
            people[data.user[0].userid] = {
                spamCount: 0
            };
        }, 10 * 1000);
    }


    //adds one to dj count
    djsOnStage += 1;


    //sets dj's songcount to zero when they enter the stage.
    djs20[data.user[0].userid] = {
        nbSong: 0
    };


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
    if (AFK === true || roomAFK === true)
    {
        justSaw(data.user[0].userid);
        justSaw1(data.user[0].userid);
        justSaw2(data.user[0].userid);
        justSaw3(data.user[0].userid);
        justSaw4(data.user[0].userid);
    }



    //adds a user to the current Djs list when they join the stage.
    currentDjs.push(data.user[0].userid);



    //tells a dj trying to get on stage how to add themselves to the queuelist
    var ifUser2 = queueList.indexOf(data.user[0].userid);
    if (queue === true && ifUser2 == -1)
    {
        if (queueList.length !== 0)
        {
            bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
        }
    }



    //removes a user from the queue list when they join the stage.
    if (queue === true)
    {
        //var ifUser = queueList.indexOf(data.user[0].userid);
        var firstOnly = queueList.indexOf(data.user[0].userid);
        var queueListLength = queueList.length;
        if (firstOnly != 1 && queueListLength !== 0)
        {
            bot.remDj(data.user[0].userid);
            ++people[data.user[0].userid].spamCount;
            if (timer[data.user[0].userid] !== null)
            {
                clearTimeout(timer[data.user[0].userid]);
                timer[data.user[0].userid] = null;
            }
            timer[data.user[0].userid] = setTimeout(function ()
            {
                people[data.user[0].userid] = {
                    spamCount: 0
                };
            }, 10 * 1000);
        }
    }
    if (queue === true)
    {
        var checkQueue = queueList.indexOf(data.user[0].name);
        var checkName2 = queueName.indexOf(data.user[0].name);
        if (checkQueue != -1 && checkQueue === 0)
        {
            clearTimeout(beginTimer);
            sayOnce = true;
            queueList.splice(checkQueue, 2);
            queueName.splice(checkName2, 1);
        }
    }

    //checks to see if user is on the banned from stage list, if they are they are removed from stage
    for (var g = 0; g < stageList.length; g++)
    {
        if (data.user[0].userid == stageList[g])
        {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ' you are banned from djing');
            ++people[data.user[0].userid].spamCount;
            if (timer[data.user[0].userid] !== null)
            {
                clearTimeout(timer[data.user[0].userid]);
                timer[data.user[0].userid] = null;
            }
            timer[data.user[0].userid] = setTimeout(function ()
            {
                people[data.user[0].userid] = {
                    spamCount: 0
                };
            }, 10 * 1000);
            break;
        }
    }


    //checks to see if user is on the manually added banned from stage list, if they are they are removed from stage
    for (var z = 0; z < bannedFromStage.length; z++)
    {
        if (bannedFromStage[z].match(data.user[0].userid)) //== bannedFromStage[z])
        {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ' you are banned from djing');
            ++people[data.user[0].userid].spamCount;
            if (timer[data.user[0].userid] !== null)
            {
                clearTimeout(timer[data.user[0].userid]);
                timer[data.user[0].userid] = null;
            }
            timer[data.user[0].userid] = setTimeout(function ()
            {
                people[data.user[0].userid] = {
                    spamCount: 0
                };
            }, 10 * 1000);
            break;
        }
    }


    //if person exceeds spam count within 10 seconds they are kicked
    if (people[data.user[0].userid].spamCount >= spamLimit)
    {
        bot.boot(data.user[0].userid, 'stop spamming');
    }

})





//checks when the bot recieves a pm
bot.on('pmmed', function (data)
{
    var senderid = data.senderid;
    var text = data.text;
    var isInRoom = theUsersList.indexOf(data.senderid); //makes sure command user is in the room
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

    if (isInRoom != -1)
    {
        isInRoom = true;
    }
    else
    {
        isInRoom = false;
    }

    if (text.match(/^\/chilly/) && isInRoom === true)
    {
        bot.speak('@' + theUsersList[name1] + ' is pleasantly chilled.');
    }
    else if (text.match(/^\/moon/) && isInRoom === true)
    {
        bot.speak('@' + theUsersList[name1] + ' is going to the moon!');
    }
    else if (text.match(/^\/modpm/) && condition === true && isInRoom === true)
    {
        var speak = text.substring(7);
        for (var g = 0; g < modList.length; g++)
        {
            var isModInRoom = theUsersList.indexOf(modList[g]);
            if (isModInRoom != -1)
            {
                bot.pm(theUsersList[name1] + ' said: ' + speak, modList[g]);
            }

        }
    }
    else if (text.match(/^\/position/)) //tells you your position in the queue, if there is one
    {
        var checkPosition = queueName.indexOf(theUsersList[name1]);

        if (checkPosition != -1 && queue === true) //if person is in the queue and queue is active
        {
            bot.pm('you are currently in position number ' + (checkPosition + 1) + ' in the queue', data.senderid);
        }
        else if (checkPosition == -1 && queue === true)
        {
            bot.pm('i can\'t tell you your position unless you are currently in the queue', data.senderid);
        }
        else
        {
            bot.pm('there is currently no queue', data.senderid);
        }
    }
    else if (text.match(/^\/playLimitOn$/) && condition === true && isInRoom === true)
    {
        PLAYLIMIT = true;
        bot.pm('the play limit is now active, dj song counters have been reset.', data.senderid);
        for (var ig = 0; ig < currentDjs.length; ig++)
        {
            djs20[currentDjs[ig]] = {
                nbSong: 0
            };
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true && isInRoom === true)
    {
        PLAYLIMIT = false;
        bot.pm('the play limit is now inactive.', data.senderid);
    }
    else if (text.match(/^\/queueOn$/) && condition === true && isInRoom === true)
    {
        queueList = [];
        queueName = [];
        bot.pm('the queue is now active.', data.senderid);
        queue = true;
    }
    else if (text.match(/^\/queueOff$/) && condition === true && isInRoom === true)
    {
        bot.pm('the queue is now inactive.', data.senderid);
        queue = false;
    }
    else if (text.match(/^\/addme$/) && queue === true && isInRoom === true)
    {
        bot.getProfile(data.senderid, function (data6)
        {
            var list3 = queueList.indexOf(data6.name);
            var list10 = currentDjs.indexOf(data.senderid)
            var checkStageList = stageList.indexOf(data.senderid);
            if (list3 == -1 && list10 == -1 && checkStageList == -1)
            {
                queueList.push(data6.name, data.senderid);
                queueName.push(data6.name);
                var temp91 = 'The queue is now: ';
                for (var hj = 0; hj < queueName.length; hj++)
                {
                    if (hj != (queueName.length - 1))
                    {
                        temp91 += queueName[hj] + ', ';
                    }
                    else if (hj == (queueName.length - 1))
                    {
                        temp91 += queueName[hj];
                    }
                }
                bot.speak(temp91);
            }
        });
    }
    else if (text.match(/^\/removeme$/) && queue === true && isInRoom === true)
    {
        bot.getProfile(data.senderid, function (data6)
        {
            var list1 = queueList.indexOf(data6.name);
            if (list1 != -1)
            {
                queueList.splice(list1, 2);
            }
            var list2 = queueName.indexOf(data6.name);
            if (list2 != -1)
            {
                if (data6.name == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueName.splice(list2, 1);
                if (queueName.length !== 0)
                {
                    var temp90 = 'The queue is now: ';
                    for (var kj = 0; kj < queueName.length; kj++)
                    {
                        if (kj != (queueName.length - 1))
                        {
                            temp90 += queueName[kj] + ', ';
                        }
                        else if (kj == (queueName.length - 1))
                        {
                            temp90 += queueName[kj];
                        }
                    }
                    bot.speak(temp90);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, you have to be in the queue to remove yourself from the queue', data.senderid);
            }
        });
    }
    else if (text.match('/removefromqueue') && queue === true && isInRoom === true)
    {
        if (condition === true)
        {
            var removeFromQueue = data.text.slice(18);
            var index5 = queueList.indexOf(removeFromQueue);
            var index6 = queueName.indexOf(removeFromQueue);
            if (index5 != -1)
            {
                if (queueName[index6] == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueList.splice(index5, 2);
                queueName.splice(index6, 1);

                if (queueName.length !== 0)
                {
                    var temp89 = 'The queue is now: ';
                    for (var jk = 0; jk < queueName.length; jk++)
                    {
                        if (jk != (queueName.length - 1))
                        {
                            temp89 += queueName[jk] + ', ';
                        }
                        else if (jk == (queueName.length - 1))
                        {
                            temp89 += queueName[jk];
                        }
                    }
                    bot.speak(temp89);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, no such person was found to be in the queue', data.senderid);
            }
        }
    }
    else if (text.match(/^\/snagevery$/) && condition === true && isInRoom === true)
    {
        if (snagSong === true)
        {
            snagSong = false;
            bot.pm('I am no longer adding every song that plays', data.senderid);
        }
        else if (snagSong === false)
        {
            snagSong = true; //this is for /snagevery
            autoSnag = false; //this turns off /autosnag
            bot.pm('I am now adding every song that plays, /autosnag has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true && isInRoom === true)
    {
        if (autoSnag === false)
        {
            autoSnag = true; //this is for /autosnag
            snagSong = false; //this is for /snagevery			
            bot.pm('I am now adding every song that gets at least (' + howManyVotes + ') awesome\'s, /snagevery has been turned off', data.senderid);
        }
        else if (autoSnag === true)
        {
            autoSnag = false;
            bot.pm('vote snagging has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/dive/) && isInRoom === true)
    {
        var checkDj = currentDjs.indexOf(data.senderid);
        if (checkDj != -1)
        {
            bot.remDj(data.senderid);
        }
        else
        {
            bot.pm('you must be on stage to use that command.', data.senderid);
        }
    }
    else if (data.text == '/getTags' && isInRoom === true)
    {
        bot.pm('artist name: ' + artist + ', song name: ' + song + ', album: ' + album + ', genre: ' + genre, data.senderid);
    }
    else if (data.text == '/roominfo' && isInRoom === true)
    {
        if (detail !== undefined)
        {
            bot.pm(detail, data.senderid);
        }
    }
    else if (text.match(/^\/getonstage$/) && condition === true && isInRoom === true)
    {
        if (getonstage === false)
        {
            bot.pm('I am now auto djing', data.senderid);
            getonstage = true;
        }
        else if (getonstage === true)
        {
            bot.pm('I am no longer auto djing', data.senderid);
            getonstage = false;
        }
    }
    else if (text.match(/^\/skipoff$/) && condition === true && isInRoom === true)
    {
        bot.pm('i am no longer skipping my songs', data.senderid);
        skipOn = false;
    }
    else if (text.match(/^\/skipon$/) && condition === true && isInRoom === true)
    {
        bot.pm('i am now skipping my songs', data.senderid);
        skipOn = true;
    }
    else if (text.match('/awesome') && isInRoom === true)
    {
        bot.vote('up');
    }
    else if (text.match('/lame') && condition === true && isInRoom === true)
    {
        bot.vote('down');
    }
    else if (text.match(/^\/messageOff/) && condition === true && isInRoom === true)
    {
        bot.pm('message: Off', data.senderid);
        MESSAGE = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true && isInRoom === true)
    {
        bot.pm('message: On', data.senderid);
        MESSAGE = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: Off', data.senderid);
        GREET = false;
    }
    else if (text.match(/^\/greeton/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: On', data.senderid);
        GREET = true;
    }
    else if (text.match(/^\/songstats/) && condition === true && isInRoom === true)
    {
        if (SONGSTATS === true)
        {
            SONGSTATS = false;
            bot.pm('song stats is now inactive', data.senderid);
        }
        else if (SONGSTATS === false)
        {
            SONGSTATS = true;
            bot.pm('song stats is now active', data.senderid);
        }
    }
    else if (text.match(/^\/playlist/) && condition === true && isInRoom === true)
    {
        bot.playlistAll(function (playlist)
        {
            bot.pm('There are currently ' + playlist.list.length + ' songs in my playlist.', data.senderid);
        });
    }
    else if (text.match(/^\/setTheme/) && condition === true && isInRoom === true)
    {
        whatIsTheme = data.text.slice(10);
        THEME = true;
        bot.pm('The theme is now set to: ' + whatIsTheme, data.senderid);
    }
    else if (text.match(/^\/noTheme/) && condition === true && isInRoom === true)
    {
        THEME = false;
        bot.pm('The theme is now inactive', data.senderid);
    }
    else if (text.match(/^\/theme/) && isInRoom === true)
    {
        if (THEME === false)
        {
            bot.pm('There is currently no theme, standard rules apply', data.senderid);
        }
        else
        {
            bot.pm('The theme is currently set to: ' + whatIsTheme, data.senderid);
        }
    }
    else if (text.match(/^\/skipsong/) && condition === true && isInRoom === true)
    {
        if (checkWhoIsDj == USERID)
        {
            bot.skip();
        }
        else
        {
            bot.pm('error, that command only skips the bots currently playing song', data.senderid);
        }
    }
    else if (text.match(/^\/roomafkoff/) && condition === true && isInRoom === true)
    {
        roomAFK = false;
        bot.pm('the audience afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/roomafkon/) && condition === true && isInRoom === true)
    {
        roomAFK = true;
        bot.pm('the audience afk list is now active.', data.senderid);
        for (var zh = 0; zh < userIds.length; zh++)
        {
            var isDj2 = currentDjs.indexOf(userIds[zh])
            if (isDj2 == -1)
            {
                justSaw3(userIds[zh]);
                justSaw4(userIds[zh]);
            }
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true && isInRoom === true)
    {
        AFK = false;
        bot.pm('the afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/afkon/) && condition === true && isInRoom === true)
    {
        AFK = true;
        bot.pm('the afk list is now active.', data.senderid);
        for (var z = 0; z < currentDjs.length; z++)
        {
            justSaw(currentDjs[z]);
            justSaw1(currentDjs[z]);
            justSaw2(currentDjs[z]);
        }
    }
    else if (text.match(/^\/autodj$/) && condition === true && isInRoom === true)
    {
        if (current < 5)
        {
            bot.addDj();
        }
        else if (current != null && current >= 5)
        {
            bot.pm('error, the stage is full', data.senderid);
        }
    }
    else if (text.match(/^\/removedj$/) && condition === true && isInRoom === true)
    {
        bot.remDj();
    }
    else if (text.match(/^\/voteskipoff$/) && condition === true && isInRoom === true)
    {
        bot.pm("vote skipping is now inactive", data.senderid);
        voteSkip = false;
        voteCountSkip = 0;
        votesLeft = HowManyVotesToSkip;
    }
    else if (text.match(/^\/mytime/) && isInRoom === true)
    {
        var msecPerMinute1 = 1000 * 60;
        var msecPerHour1 = msecPerMinute1 * 60;
        var msecPerDay1 = msecPerHour1 * 24;
        var endTime1 = Date.now();
        var currentTime1 = endTime1 - myTime[data.senderid];

        var days1 = Math.floor(currentTime1 / msecPerDay1);
        currentTime1 = currentTime1 - (days1 * msecPerDay1);

        var hours1 = Math.floor(currentTime1 / msecPerHour1);
        currentTime1 = currentTime1 - (hours1 * msecPerHour1);

        var minutes1 = Math.floor(currentTime1 / msecPerMinute1);


        bot.pm('you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes', data.senderid);

    }
    else if (text.match(/^\/uptime/) && isInRoom === true)
    {
        var msecPerMinute = 1000 * 60;
        var msecPerHour = msecPerMinute * 60;
        var msecPerDay = msecPerHour * 24;
        endTime = Date.now();
        var currentTime = endTime - beginTime;

        var days = Math.floor(currentTime / msecPerDay);
        currentTime = currentTime - (days * msecPerDay);

        var hours = Math.floor(currentTime / msecPerHour);
        currentTime = currentTime - (hours * msecPerHour);

        var minutes = Math.floor(currentTime / msecPerMinute);

        bot.pm('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes', data.senderid);
    }
    else if (text.match(/^\/voteskipon/) && condition === true && isInRoom === true)
    {
        checkVotes = [];
        HowManyVotesToSkip = Number(data.text.slice(12))
        if (isNaN(HowManyVotesToSkip) || HowManyVotesToSkip === 0)
        {
            bot.pm("error, please enter a valid number", data.senderid);
        }

        if (!isNaN(HowManyVotesToSkip) && HowManyVotesToSkip !== 0)
        {
            bot.pm("vote skipping is now active, current votes needed to pass " + "the vote is " + HowManyVotesToSkip, data.senderid);
            voteSkip = true;
            voteCountSkip = 0;
            votesLeft = HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/queue$/) && isInRoom === true)
    {
        if (queue === true && queueName.length !== 0)
        {
            var temp95 = 'The queue is now: ';
            for (var kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl];
                }
            }
            bot.pm(temp95, data.senderid);

        }
        else if (queue === true)
        {
            bot.pm('The queue is currently empty.', data.senderid);
        }
        else
        {
            bot.pm('There is currently no queue.', data.senderid);
        }
    }
    else if (text.match(/^\/randomSong$/) && condition === true && isInRoom === true)
    {
        if (randomOnce != 1)
        {
            bot.playlistAll(function (playlist)
            {
                var ez = 0;
                bot.pm("Reorder initiated.", data.senderid);
                ++randomOnce;
                var reorder = setInterval(function ()
                {
                    if (ez <= playlist.list.length)
                    {
                        var nextId = Math.ceil(Math.random() * playlist.list.length);
                        bot.playlistReorder(ez, nextId);
                        console.log("Song " + ez + " changed.");
                        ez++;
                    }
                    else
                    {
                        clearInterval(reorder);
                        console.log("Reorder Ended");
                        bot.pm("Reorder completed.", data.senderid);
                        --randomOnce;
                    }
                }, 1000);
            });
        }
        else
        {
            bot.pm('error, playlist reordering is already in progress', data.senderid);
        }
    }
    else if (text.match('/bumptop') && condition === true && isInRoom === true)
    {
        if (queue === true)
        {
            var topOfQueue = data.text.slice(10);
            var index35 = queueList.indexOf(topOfQueue);
            var index46 = queueName.indexOf(topOfQueue);
            var index80 = theUsersList.indexOf(topOfQueue);
            var index81 = theUsersList[index80];
            var index82 = theUsersList[index80 - 1];
            if (index35 != -1 && index80 != -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                queueList.splice(index35, 2);
                queueList.unshift(index81, index82);
                queueName.splice(index46, 1);
                queueName.unshift(index81);
                var temp92 = 'The queue is now: ';
                for (var po = 0; po < queueName.length; po++)
                {
                    if (po != (queueName.length - 1))
                    {
                        temp92 += queueName[po] + ', ';
                    }
                    else if (po == (queueName.length - 1))
                    {
                        temp92 += queueName[po];
                    }
                }
                bot.speak(temp92);
            }
        }
    }
    else if (text.match(/^\/lengthLimit/) && condition === true && isInRoom === true)
    {
        if (LIMIT === true)
        {
            LIMIT = false;
            bot.pm('the song length limit is now inactive', data.senderid);
        }
        else
        {
            LIMIT = true;
            bot.pm('the song length limit is now active', data.senderid);
        }
    }
    else if (text.match(/^\/m/) && condition === true && isInRoom === true)
    {
        bot.speak(text.substring(3));
    }
    else if (text.match(/^\/stage/) && condition === true && isInRoom === true)
    {
        var ban = data.text.slice(8);
        var checkUser = theUsersList.indexOf(ban) - 1;
        if (checkUser != -1)
        {
            bot.remDj(theUsersList[checkUser]);
            condition = false;
        }
    }
    else if (text.match(/^\/botstatus/) && condition === true && isInRoom === true)
    {
        var whatsOn = '';

        if (queue === true)
        {
            whatsOn += 'queue: On, ';
        }
        else
        {
            whatsOn += 'queue: Off, ';
        }
        if (AFK === true)
        {
            whatsOn += 'dj afk limit: On, ';
        }
        else
        {
            whatsOn += 'dj afk limit: Off, ';
        }
        if (getonstage === true)
        {
            whatsOn += 'autodjing: On, ';
        }
        else
        {
            whatsOn += 'autodjing: Off, ';
        }
        if (MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (PLAYLIMIT === true)
        {
            whatsOn += 'song play limit: On, ';
        }
        else
        {
            whatsOn += 'song play limit: Off, ';
        }
        if (skipOn === true)
        {
            whatsOn += 'autoskipping: On, ';
        }
        else
        {
            whatsOn += 'autoskipping: Off, ';
        }
        if (snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (autoSnag === true)
        {
            whatsOn += 'vote based song adding: On, ';
        }
        else
        {
            whatsOn += 'vote based song adding: Off, ';
        }
        if (randomOnce === 0)
        {
            whatsOn += 'playlist reordering in progress?: No';
        }
        else
        {
            whatsOn += 'playlist reordering in progress?: Yes';
        }

        bot.pm(whatsOn, data.senderid);
    }
    else if (text.match(/^\/djplays/) && isInRoom === true)
    {
        if (currentDjs.length !== 0)
        {
            var djsnames = [];
            var djplays = 'dj plays: ';
            for (var i = 0; i < currentDjs.length; i++)
            {
                var djname = theUsersList.indexOf(currentDjs[i]) + 1;
                djsnames.push(theUsersList[djname]);
                if (currentDjs[i] != currentDjs[(currentDjs.length - 1)])
                {
                    djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong + ', ';
                }
                else
                {
                    djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong;
                }
            }
            bot.pm(djplays, data.senderid);
        }
        else if (currentDjs.length === 0)
        {
            bot.pm('There are no dj\'s on stage.', data.senderid);
        }
    }
    else if (text.match('/banstage') && condition === true && isInRoom === true)
    {
        var ban12 = data.text.slice(11);
        var checkBan = stageList.indexOf(ban12);
        var checkUser12 = theUsersList.indexOf(ban12);
        if (checkBan == -1 && checkUser12 != -1)
        {
            stageList.push(theUsersList[checkUser12 - 1], theUsersList[checkUser12]);
            bot.remDj(theUsersList[checkUser12 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unbanstage') && condition === true && isInRoom === true)
    {
        var ban2 = data.text.slice(13);
        index = stageList.indexOf(ban2);
        if (index != -1)
        {
            stageList.splice(stageList[index - 1], 2);
            condition = false;
            index = null;
        }
    }
    else if (text.match('/userid') && condition === true && isInRoom === true)
    {
        var ban86 = data.text.slice(9);
        var checkUser9 = bot.getUserId(ban86, function (data)
        {
            var userid59 = data.userid;
            if (typeof (userid59) !== 'undefined')
            {
                bot.pm(userid59, senderid);
                condition = false;
            }
            else
            {
                bot.pm('I\'m sorry that userid is undefined', senderid);
            }
        });
    }
    else if (text.match('/ban') && condition === true && isInRoom === true)
    {
        var ban17 = data.text.slice(6);
        var checkBan17 = blackList.indexOf(ban17);
        var checkUser17 = theUsersList.indexOf(ban17);
        if (checkBan17 == -1 && checkUser17 != -1)
        {
            blackList.push(theUsersList[checkUser17 - 1], theUsersList[checkUser17]);
            bot.boot(theUsersList[checkUser17 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unban') && condition === true && isInRoom === true)
    {
        var ban20 = data.text.slice(8);
        index = blackList.indexOf(ban20);
        if (index != -1)
        {
            blackList.splice(blackList[index - 1], 2);
            condition = false;
            index = null;
        }
    }
    else if (text.match(/^\/stalk/) && condition === true && isInRoom === true)
    {
        var stalker = text.substring(7);
        bot.stalk(stalker, allInformations = true, function (data4)
        {
            if (data4.success !== false)
            {
                bot.pm('User found in room: http://turntable.fm/' + data4.room.shortcut, data.senderid);
            }
            else
            {
                bot.pm('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist', data.senderid);
            }
        });
    }
    else if (text.match(/^\/whobanned$/) && condition === true && isInRoom === true)
    {
        if (blackList.length !== 0)
        {
            bot.pm('ban list: ' + blackList, data.senderid);
        }
        else
        {
            bot.pm('The ban list is empty.', data.senderid);
        }
    }
    else if (text.match(/^\/whostagebanned$/) && condition === true && isInRoom === true)
    {
        if (stageList.length !== 0)
        {
            bot.pm('banned from stage: ' + stageList, data.senderid);
        }
        else
        {
            bot.pm('The banned from stage list is currently empty.', data.senderid);
        }
    }
    else if (data.text == '/stopescortme' && isInRoom === true)
    {
        bot.pm('you will no longer be escorted after you play your song', data.senderid);
        var escortIndex = escortList.indexOf(data.senderid);
        if (escortIndex != -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text == '/escortme' && isInRoom === true)
    {
        var djListIndex = currentDjs.indexOf(data.senderid);
        var escortmeIndex = escortList.indexOf(data.senderid);
        if (djListIndex != -1 && escortmeIndex == -1)
        {
            escortList.push(data.senderid);
            bot.pm('you will be escorted after you play your song', data.senderid);
        }
    }
    else if (text.match(/^\/snag/) && condition === true && isInRoom === true)
    {
        if (getSong !== null)
        {
            bot.playlistAll(function (playlist)
            {
                var found = false;
                for (var igh = 0; igh < playlist.list.length; igh++)
                {
                    if (playlist.list[igh]._id == getSong)
                    {
                        found = true;
                        bot.pm('I already have that song', data.senderid);
                    }
                }
                if (!found)
                {
                    bot.playlistAdd(getSong, playlist.list.length);
                    bot.pm('song added', data.senderid);
                }
            });
        }
        else
        {
            bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.senderid);
        }
    }
    else if (text.match(/^\/inform$/) && condition === true && isInRoom === true)
    {
        if (informTimer === null)
        {
            var checkDjsName = theUsersList.indexOf(lastdj) + 1;
            bot.speak('@' + theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
            informTimer = setTimeout(function ()
            {
                bot.pm('you took too long to skip your song', lastdj);
                bot.remDj(lastdj);
                informTimer = null;
            }, 20 * 1000);
        }
    }
    else if (text.match(/^\/removesong$/) && condition === true && isInRoom === true)
    {
        bot.playlistAll(function (playlist)
        {
            if (checkWhoIsDj == USERID)
            {
                var remove5 = playlist.list.length - 1;
                bot.skip();
                bot.playlistRemove(remove5);
                bot.pm('the last snagged song has been removed.', data.senderid);
            }
            else
            {
                var remove = playlist.list.length - 1;
                bot.playlistRemove(remove);
                bot.pm('the last snagged song has been removed.', data.senderid);
            }
        })
    }
    else if (text.match('/username') && condition === true && isInRoom === true)
    {
        var ban7 = data.text.slice(10);
        var tmp94 = bot.getProfile(ban7, function (data)
        {
            bot.pm(data.name, senderid);
        });
    }
    else if (text.match(/^\/afk/) && isInRoom === true)
    {
        var isUserAfk = theUsersList.indexOf(data.senderid) + 1;
        var isAlreadyAfk = afkPeople.indexOf(theUsersList[isUserAfk]);
        if (isAlreadyAfk == -1)
        {
            bot.pm('you are marked as afk', data.senderid);
            afkPeople.push(theUsersList[isUserAfk]);
        }
        else if (isAlreadyAfk != -1)
        {
            bot.pm('you are no longer afk', data.senderid);
            afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text.match(/^\/whosafk/) && isInRoom === true)
    {
        if (afkPeople.length !== 0)
        {
            var whosAfk = 'marked as afk: ';
            for (var f = 0; f < afkPeople.length; f++)
            {
                if (f != (afkPeople.length - 1))
                {
                    whosAfk = whosAfk + afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + afkPeople[f];
                }
            }
            bot.pm(whosAfk, data.senderid);
        }
        else
        {
            bot.pm('No one is currently marked as afk', data.senderid);
        }
    }
    else if (text.match(/^\/commands/) && isInRoom === true)
    {
        bot.pm('the commands are  /awesome, ' +
            ' /mom, /chilly, /cheers, /theme, /fanratio @, /mytime, /playlist, /position, /moon, /coinflip, /dance, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, ' +
            '/dice, /props, /m, /getTags, /skip, /dive, /surf, /smoke, /uptime, /djplays, /afk, /whosafk, /admincommands, /queuecommands, /pmcommands', data.senderid);
    }
    else if (text.match(/^\/queuecommands/) && isInRoom === true)
    {
        bot.pm('the commands are /queue, /removefromqueue, /removeme, /addme, /queueOn, /queueOff, /bumptop', data.senderid);
    }
    else if (text.match(/^\/pmcommands/) && condition === true && isInRoom === true) //the moderators see this
    {
        bot.pm('/chilly, /moon, /modpm, /playlist, /snagevery, /autosnag, /position, /theme, /mytime, /uptime, /m, /stage @, /botstatus, /djplays, /banstage @, /unbanstage @, ' +
            '/userid @, /ban @, /unban @, /stalk, /whobanned, /whostagebanned, /stopescortme, /escortme, /snag, /inform, ' +
            '/removesong, /username, /afk, /whosafk, /commands, /admincommands', data.senderid);
    }
    else if (text.match(/^\/pmcommands/) && !condition === true && isInRoom === true) //non - moderators see this
    {
        bot.pm('/chilly, /moon, /addme, /removeme, /position, /dive, /getTags, /roominfo, /awesome, ' + '/theme, /mytime, /uptime, /queue, /djplays, /stopescortme, /escortme, /afk, ' + '/whosafk, /commands, /queuecommands', data.senderid);
    }
    else if (text.match(/^\/admincommands/) && condition === true && isInRoom === true)
    {
        bot.pm('the mod commands are /ban @, /unban @, /snagevery, /autosnag, /skipon, /playLimitOn, /playLimitOff, /skipoff, /stalk, /lengthLimit, /setTheme, /noTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
            '/snag, /botstatus, /removesong, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, ' +
            '/whobanned, /whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm', data.senderid);
        condition = false;
    }
});





//starts up when bot first enters the room
bot.on('roomChanged', function (data)
{

    //start the uptime
    beginTime = Date.now();


    //gets your rooms name and shortcut
    roomName = data.room.name;
    ttRoomName = data.room.shortcut;



    //finds out who the currently playing dj's are.    
    for (var iop = 0; iop < data.room.metadata.djs.length; iop++)
    {
        currentDjs.push(data.room.metadata.djs[iop]);

    }



    //counts how many djs there are on stage
    djsOnStage = currentDjs.length;



    //initializes currently playing dj's song count to zero.
    var currentPlayers = data.room.metadata.djs;
    for (var iz = 0; iz < currentPlayers.length; iz++)
    {
        djs20[currentPlayers[iz]] = {
            nbSong: 0
        };
    }



    //list of escorts, users, and moderators is reset    
    escortList = [];
    theUsersList = [];
    modList = [];



    //set modlist to list of moderators
    //modList = data.room.metadata.moderator_id;
    for (var ihp = 0; ihp < data.room.metadata.moderator_id.length; ihp++)
    {
        modList.push(data.room.metadata.moderator_id[ihp]);
    }



    //used to get room description
    detail = data.room.description;



    //used to get user names and user id's
    var users = data.users;
    for (var i = 0; i < users.length; i++)
    {
        var user = users[i];
        user.lastActivity = user.loggedIn = new Date();
        theUsersList.push(user.userid, user.name);
        userIds.push(user.userid);
    }



    //sets everyones spam count to zero	
    //puts people on the global afk list when it joins the room	
    for (var z = 0; z < userIds.length; z++)
    {
        people[userIds[z]] = {
            spamCount: 0
        };
        justSaw3(userIds[z]);
        justSaw4(userIds[z]);
    }



    //starts time in room for everyone currently in the room
    for (var zy = 0; zy < userIds.length; zy++)
    {
        myTime[userIds[zy]] = Date.now();
    }

});






//starts up when a new person joins the room
bot.on('registered', function (data)
{

    if (queue === true && djsOnStage == 5)
    {
        bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
    }


    //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
    var roomjoin = data.user[0];
    var areTheyBanned = blackList.indexOf(data.user[0].userid);
    var areTheyBanned2 = bannedUsers.indexOf(data.user[0].userid);
    if (GREET === true && data.user[0].userid != USERID && !data.user[0].name.match('@ttstat'))
    {
        if (areTheyBanned == -1 && areTheyBanned2 == -1)
        {
            if (greetingTimer[data.user[0].userid] !== null)
            {
                clearTimeout(greetingTimer[data.user[0].userid]);
                greetingTimer[data.user[0].userid] = null;
            }
            greetingTimer[data.user[0].userid] = setTimeout(function ()
            {
                greetingTimer[data.user[0].userid] = null;
                if (THEME === false) //if theres no theme this is the message.
                {
                    bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ' enjoy your stay!');
                }
                else
                {
                    bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ' the theme is currently set to: ' + whatIsTheme);
                }
                delete greetingTimer[data.user[0].userid];
            }, 3 * 1000);
        }
    }


    //starts time for everyone that joins the room
    myTime[data.user[0].userid] = Date.now();


    //adds users who join the room to the user list if their not already on the list
    var checkList = theUsersList.indexOf(data.user[0].userid);
    if (checkList == -1)
    {
        theUsersList.push(data.user[0].userid, data.user[0].name);
    }



    //checks to see if user is on the banlist, if they are they are booted from the room.
    for (var i = 0; i < blackList.length; i++)
    {
        if (roomjoin.userid == blackList[i])
        {
            bot.bootUser(roomjoin.userid, 'You are on the banlist.');
            break;
        }
    }



    //checks manually added users
    for (var z = 0; z < bannedUsers.length; z++)
    {
        if (bannedUsers[z].match(roomjoin.userid))
        {
            bot.bootUser(roomjoin.userid, 'You are on the banlist.');
            break;
        }
    }



    //sets new persons spam count to zero
    people[data.user[0].userid] = {
        spamCount: 0
    };



    //puts people who join the room on the global afk list
    if (roomAFK === true)
    {
        justSaw3(data.user[0].userid);
        justSaw4(data.user[0].userid);
    }



    //this kicks the ttstats bot
    if (kickTTSTAT === true)
    {
        if (data.user[0].name.match('@ttstat'))
        {
            bot.boot(data.user[0].userid);
        }
    }

});






//updates the moderator list when a moderator is removed.
bot.on('rem_moderator', function (data)
{
    var test51 = modList.indexOf(data.userid);
    modList.splice(test51, 1);
})





//updates the moderator list when a moderator is added.
bot.on('new_moderator', function (data)
{
    var test50 = modList.indexOf(data.userid);
    if (test50 == -1)
    {
        modList.push(data.userid);
    }
})






//starts up when a user leaves the room
bot.on('deregistered', function (data)
{
    //removes dj's from the lastSeen object when they leave the room
    delete lastSeen[data.user[0].userid];
    delete lastSeen1[data.user[0].userid];
    delete lastSeen2[data.user[0].userid];
    delete lastSeen3[data.user[0].userid];
    delete lastSeen4[data.user[0].userid];
    delete people[data.user[0].userid];
    delete timer[data.user[0].userid];
    delete myTime[data.user[0].userid];


    //removes people who leave the room from the afk list
    if (afkPeople.length !== 0)
    {
        var userName = data.user[0].name;
        var checkUserName = afkPeople.indexOf(data.user[0].name);
        if (checkUserName != -1)
        {
            afkPeople.splice(checkUserName, 1);
        }
    }


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
bot.on('endsong', function (data)
{

    //bot says song stats for each song
    if (SONGSTATS === true)
    {
        bot.speak('stats for ' + song + ' by ' + artist + ': ' + ':arrow_down:' + downVotes + ':arrow_up:' + upVotes + '<3' + whoSnagged);
    }


    //iterates through the dj list incrementing dj song counts and
    //removing them if they are over the limit.
    var djId = data.room.metadata.current_dj;
    if (++djs20[djId].nbSong >= playLimit)
    {
        var checklist33 = theUsersList.indexOf(djId) + 1;
        if (djId != USERID && PLAYLIMIT === true)
        {
            bot.speak('@' + theUsersList[checklist33] + ' you are over the playlimit of ' + playLimit + ' songs');
            bot.remDj(djId);
        }

    }


    //iterates through the escort list and escorts all djs on the list off the stage.	  
    for (var i = 0; i < escortList.length; i++)
    {
        if (data.room.metadata.current_dj == escortList[i])
        {
            var lookname = theUsersList.indexOf(data.room.metadata.current_dj) + 1;
            bot.remDj(escortList[i]);
            bot.speak('@' + theUsersList[lookname] + ' had enabled escortme');
            var removeFromList = escortList.indexOf(escortList[i]);
            escortList.splice(removeFromList, 1);
        }
    }

});