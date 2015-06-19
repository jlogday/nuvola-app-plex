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

// Translations
var _ = Nuvola.Translate.gettext;

// Handy aliases
var PlaybackState = Nuvola.PlaybackState;
var PlayerAction = Nuvola.PlayerAction;

// Preferences constants
var DEFAULT_ADDRESS = "http://localhost:32400/web";
var ADDRESS = "app.address";

// Create new WebApp prototype
var WebApp = Nuvola.$WebApp();

WebApp._onInitAppRunner = function(emitter)
{
    Nuvola.WebApp._onInitAppRunner.call(this, emitter);

    Nuvola.config.setDefault(ADDRESS, DEFAULT_ADDRESS);

    Nuvola.core.connect("InitializationForm", this);
    Nuvola.core.connect("PreferencesForm", this);
}

WebApp._onInitializationForm = function(emitter, values, entries)
{
    if (!Nuvola.config.hasKey(ADDRESS)) {
        this.appendPreferences(values, entries);
    }
}

WebApp._onPreferencesForm = function(emitter, values, entries)
{
    this.appendPreferences(values, entries);
}

WebApp.appendPreferences = function(values, entries)
{
    values[ADDRESS] = Nuvola.config.get(ADDRESS);

    entries.push(["header", _("Plex Media Server")]);
    entries.push(["label", _("Address of your Plex Media Server")]);
    entries.push(["string", ADDRESS, "Address"]);
}

WebApp._onHomePageRequest = function(emitter, result)
{
    result.url = Nuvola.config.get(ADDRESS);
}

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

// Extract data from the web page
WebApp.update = function()
{
    var state = PlaybackState.UNKNOWN;
    var prevSong = false;
    var nextSong = false;

    var playButton = this.getPlayButton();
    if (playButton) {
        if (playButton.isHidden()) {
            state = PlaybackState.PLAYING;
        }
        else {
            state = PlaybackState.PAUSED;
        }

        var prevButton = this.getPreviousButton();
        prevSong = prevButton && prevButton.isEnabled();

        var nextButton = this.getNextButton();
        nextSong = nextButton && nextButton.isEnabled();

        this.setTrackInfo();
    }

    player.setPlaybackState(state);
    player.setCanPlay(state === PlaybackState.PAUSED || state === PlaybackState.UNKNOWN);
    player.setCanPause(state === PlaybackState.PLAYING);
    player.setCanGoPrev(prevSong);
    player.setCanGoNext(nextSong);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

WebApp.setTrackInfo = function()
{
    var track = {};

    var elmt = document.querySelector('div.mini-controls-left div.media-poster');
    if (elmt) {
        track.album = elmt.getAttribute('data-parent-title') || 'Unknown Album';
        track.artLocation = elmt.getAttribute('data-image-url') || null;
    }
    else {
        track.album = null;
        track.artLocation = null;
    }

    elmt = document.querySelector('button.grandparent-title');
    if (elmt) {
        track.artist = elmt.innerText || 'Unknown Artist';
    }
    else {
        track.artist = null;
    }

    elmt = document.querySelector('button.item-title');
    if (elmt) {
        track.title = elmt.innerText || 'Unknown Title';
    }
    else {
        track.title = null;
    }

    player.setTrack(track);
}

WebApp.getButton = function(name)
{
    var button = document.querySelector('div.mini-controls-center-buttons button.' + name + '-btn');
    if (button) {
        button.isHidden = function()
        {
            return this.className.indexOf('hidden') !== -1;
        }

        button.isEnabled = function()
        {
            return this.className.indexOf('disabled') === -1;
        }
    }

    return button;
}

WebApp.getPlayButton = function()
{
    return this.getButton('play');
}

WebApp.getPauseButton = function()
{
    return this.getButton('pause');
}

WebApp.getStopButton = function()
{
    return this.getButton('stop');
}

WebApp.getPreviousButton = function()
{
    return this.getButton('previous');
}

WebApp.getNextButton = function()
{
    return this.getButton('next');
}


// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param) {
    switch (name) {
        case PlayerAction.TOGGLE_PLAY:
            var playButton = this.getPlayButton();

            if (playButton && !playButton.isHidden()) {
                Nuvola.clickOnElement(playButton);
            }
            else {
                var pauseButton = this.getPauseButton();
                if (pauseButton && !pauseButton.isHidden()) {
                    Nuvola.clickOnElement(pauseButton);
                }
            }

            break;
        case PlayerAction.PLAY:
            var playButton = this.getPlayButton();

            if (playButton && !playButton.isHidden()) {
                Nuvola.clickOnElement(playButton);
            }
            else {
                try {
                    document.querySelector('div.section-side-bar-container').getElementsByClassName('play-btn')[0].click()
                }
                catch (e) {}
            }

            break;
        case PlayerAction.PAUSE:
            var pauseButton = this.getPauseButton();
            if (pauseButton && !pauseButton.isHidden()) {
                Nuvola.clickOnElement(pauseButton);
            }

            break;
        case PlayerAction.STOP:
            var stopButton = this.getStopButton();
            if (stopButton && !stopButton.isHidden()) {
                Nuvola.clickOnElement(stopButton);
            }

            break;
        case PlayerAction.PREV_SONG:
            var previousButton = this.getPreviousButton();
            if (previousButton && !previousButton.isHidden()) {
                Nuvola.clickOnElement(previousButton);
            }

            break;
        case PlayerAction.NEXT_SONG:
            var nextButton = this.getNextButton();
            if (nextButton && !nextButton.isHidden()) {
                Nuvola.clickOnElement(nextButton);
            }

            break;
    }
}

WebApp.start();

})(this);  // function(Nuvola)
