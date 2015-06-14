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

function fetchButton(className) {
    var rval = null;
    var nl = document.getElementsByClassName(className);
    if (nl.length > 0) {
        rval = nl[0];
    }

    return rval;
}

function isHidden(elmt) {
    return elmt.className.indexOf('hidden') !== -1;
}

function isDisabled(elmt) {
    return elmt.className.indexOf('disabled') !== -1;
}


// Extract data from the web page
WebApp.update = function()
{
    var track = {};

    // album only appears to be stored as an attribute in a different element
    track.album = null;
    track.artist = fetchTrackInfo('grandparent-title') || 'Unknown Artist';
    track.title = fetchTrackInfo('item-title') || 'Unknown Title';

    player.setTrack(track);

    var state = PlaybackState.UNKNOWN;
    var prevSong = false;
    var nextSong = false;
    try {
        var playButton = document.querySelector('div.mini-controls-center-buttons button.play-btn');
        if (playButton) {
            if (isHidden(playButton)) {
                state = PlaybackState.PLAYING;
            }
            else {
                state = PlaybackState.PAUSED;
            }

            var prevButton = document.querySelector('div.mini-controls-center-buttons button.previous-btn');
            prevSong = prevButton && !isDisabled(prevButton);
            var nextButton = document.querySelector('div.mini-controls-center-buttons button.next-btn');
            nextSong = nextButton && !isDisabled(nextButton);
        }
    }
    catch (e) {
        state = PlaybackState.UNKNOWN;
    }

    player.setPlaybackState(state);
    player.setCanPause(state === PlaybackState.PLAYING);
    player.setCanPlay(state === PlaybackState.PAUSED || state === PlaybackState.UNKNOWN);
    player.setCanGoPrev(prevSong);
    player.setCanGoNext(nextSong);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param) {
    switch (name) {
        case PlayerAction.TOGGLE_PLAY:
            var pp;
            var playButton = document.querySelector('div.mini-controls-center-buttons button.play-btn');

            if (playButton && !isHidden(playButton)) {
                pp = playButton;
            }
            else {
                var pauseButton = fetchButton('pause-btn');
                var pauseButton = document.querySelector('div.mini-controls-center-buttons button.pause-btn');
                if (pauseButton && !isHidden(pauseButton)) {
                    pp = pauseButton;
                }
            }

            if (pp) {
                Nuvola.clickOnElement(pp);
            }

            break;
        case PlayerAction.PLAY:
            /*var playButton = document.querySelector('div.mini-controls-center-buttons button.play-btn');
            if (playButton) {
                Nuvola.clickOnElement(playButton);
            }*/
            try {
                document.querySelector('div.section-side-bar-container').getElementsByClassName('play-btn')[0].click()
            }
            catch (e) {}

            break;
        case PlayerAction.PAUSE:
            var pauseButton = document.querySelector('div.mini-controls-center-buttons button.pause-btn');
            if (pauseButton) {
                Nuvola.clickOnElement(pauseButton);
            }

            break;
        case PlayerAction.STOP:
            var stopButton = document.querySelector('div.mini-controls-center-buttons button.stop-btn');
            if (stopButton) {
                Nuvola.clickOnElement(stopButton);
            }

            break;
        case PlayerAction.PREV_SONG:
            var prevButton = document.querySelector('div.mini-controls-center-buttons button.previous-btn');
            if (prevButton) {
                Nuvola.clickOnElement(prevButton);
            }

            break;
        case PlayerAction.NEXT_SONG:
            var nextButton = document.querySelector('div.mini-controls-center-buttons button.next-btn');
            if (nextButton) {
                Nuvola.clickOnElement(nextButton);
            }

            break;
    }
}

WebApp.start();

})(this);  // function(Nuvola)
