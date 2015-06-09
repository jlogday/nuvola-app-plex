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


// Extract data from the web page
WebApp.update = function()
{
    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null // always null
    }

    // album only appears to be stored as an attribute in a different element
    track['artist'] = fetchTrackInfo('grandparent-title') || 'Unknown Artist';
    track['title'] = fetchTrackInfo('item-title') || 'Unknown Title';

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
        var nl = document.getElementsByClassName("previous-btn");
        if (nl.length > 0) {
            enabled = !nl[0].disabled;
        }
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
    player.setCanPlay(true);

    try {
        enabled  = playPause.innerText == "Pause";
    }
    catch(e) {
        enabled = false;
    }
    player.setCanPause(true);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param) {
    switch (name) {
        case PlayerAction.TOGGLE_PLAY:
            var nl = document.getElementsByClassName("pause-btn");
            if (nl.length > 0) {
                Nuvola.clickOnElement(nl[0]);
            }
            break;
        case PlayerAction.PLAY:
            var nl = document.getElementsByClassName("play-btn");
            if (nl.length > 0) {
                Nuvola.clickOnElement(nl[0]);
            }
            break;
        case PlayerAction.PAUSE:
            var nl = document.getElementsByClassName("pause-btn");
            if (nl.length > 0) {
                Nuvola.clickOnElement(nl[0]);
            }
            break;
        case PlayerAction.STOP:
            var nl = document.getElementsByClassName("stop-btn");
            if (nl.length > 0) {
                Nuvola.clickOnElement(nl[0]);
            }
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
