/*
 * Copyright 2015 Jason Day <jason@jlogday.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

(function(Nuvola)
{

// Create media player component
var player = Nuvola.$object(Nuvola.MediaPlayer);

// Handy aliases
var PlaybackState = Nuvola.PlaybackState;
var PlayerAction = Nuvola.PlayerAction;

// Create new WebApp prototype
var WebApp = Nuvola.$WebApp();

// Initialization routines
WebApp._onInitWebWorker = function(emitter)
{
    Nuvola.WebApp._onInitWebWorker.call(this, emitter);

    var state = document.readyState;
    if (state === "interactive" || state === "complete") {
        this._onPageReady();
    }
    else {
        document.addEventListener("DOMContentLoaded", this._onPageReady.bind(this));
    }
}

// Page is ready for magic
WebApp._onPageReady = function()
{
    // Connect handler for signal ActionActivated
    Nuvola.actions.connect("ActionActivated", this);

    // Start update routine
    this.update();
}

function fetchTrackInfo(className) {
    var rval = null;
    var nl = document.getElementsByClassName(className);
    if (nl.length > 0) {
        rval = nl[0].innerText;
    }

    return rval;
}

/*function fetchTrackInfo() {
    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null // always null
    }
    var elmt = document.querySelector('div.media-poster');
    console.log('elmt: ' + elmt);
    if (elmt) {
        track['title'] = elmt.getAttribute('data-title') || 'Unknown Title';
        track['artist'] = elmt.getAttribute('data-grandparent-title') || 'Unknown Artist';
        track['album'] = elmt.getAttribute('data-image-title') || 'Unknown Album';
    }

    return track;
}*/


// Extract data from the web page
WebApp.update = function()
{
    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null // always null
    }

    /*var idMap = { title: "track", artist: "artist", album: "album" }
    for (var key in idMap) {
        try {
            track[key] = document.getElementById(idMap[key]).innerText || null;
        }
        catch (e) {
            track[key] = null;
        }
    }

    track['title'] = "Oigen Boigen!";*/
    /*var elmt = document.getElementsByClassName("grandparent-title");
    console.log("elmt: " + elmt);
    if (elmt) {
        console.log("len: " + elmt.length);
        if (elmt.length >= 1) {
            var artist = elmt[0].innerText;
            console.log("artist: " + artist);
            track['artist'] = artist;
        }
    }
    */
    //var artist = fetchTrackInfo('grandparent-title');
    //track['artist'] = artist || 'Unknown Artist';
    track['artist'] = fetchTrackInfo('grandparent-title') || 'Unknown Artist';
    track['title'] = fetchTrackInfo('item-title') || 'Unknown Title';
    //var track = fetchTrackInfo();

    player.setTrack(track);

    try {
        switch (document.getElementById("status").innerText) {
            case "Playing":
                var state = PlaybackState.PLAYING;
                break;
            case "Paused":
                var state = PlaybackState.PAUSED;
                break;
            default:
                var state = PlaybackState.UNKNOWN;
                break;
        }
    }
    catch (e) {
        var state = PlaybackState.UNKNOWN;
    }

    player.setPlaybackState(state);
    
    var enabled;
    try {
        enabled = !document.getElementById("prev").disabled;
    }
    catch(e) {
        enabled = false;
    }
    player.setCanGoPrev(enabled);

    try {
        enabled  = !document.getElementById("next").disabled;
    }
    catch(e) {
        enabled = false;
    }
    player.setCanGoNext(enabled);

    var playPause = document.getElementById("pp");
    try {
        enabled  = playPause.innerText == "Play";
    }
    catch(e) {
        enabled = false;
    }
    player.setCanPlay(enabled);

    try {
        enabled  = playPause.innerText == "Pause";
    }
    catch(e) {
        enabled = false;
    }
    player.setCanPause(enabled);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param) {
    switch (name) {
        case PlayerAction.TOGGLE_PLAY:
            var button = document.getElementsByClassName("pause-btn");
            console.log("button: " + button);
            if (button) {
                Nuvola.clickOnElement(button);
            }
            break;
        case PlayerAction.PLAY:
        case PlayerAction.PAUSE:
        case PlayerAction.STOP:
            Nuvola.clickOnElement(document.getElementById("pp"));
            break;
        case PlayerAction.PREV_SONG:
            Nuvola.clickOnElement(document.getElementById("prev"));
            break;
        case PlayerAction.PREV_SONG:
            Nuvola.clickOnElement(document.getElementById("next"));
            break;
    }
}

WebApp.start();

})(this);  // function(Nuvola)
