/**
 * Various aspects about player
 */

console.log("Scripts::Running script player_controller.js");

var PlayerController = {
    TAG: 'PlayerController',
    POSITION_END: 0,
    POSITION_ONE_SEC: 1,
    checkTimeoutMS: 500,
    numTries: 0,
    advanceTimeSec: 20,

    jumpToEnd: function(onFail) {
        this.numTries = 10;
        this.setPosition(this.POSITION_END, onFail);
    },

    advance: function(onFail) {
        this.numTries = 10;
        this.setPosition(this.POSITION_ONE_SEC, onFail);
    },

    setPosition: function(position, onFail) {
        Log.d(this.TAG, "Updating position of the video");

        var $this = this;

        var player = YouTubeUtils.getPlayer();

        if (player) {
            if (isNaN(player.duration)) {
                if (this.numTries-- <= 0) {
                    Log.d(this.TAG, "Can't unfreeze video... Running on fail callback...");

                    if (onFail) {
                        onFail.call();
                    }

                    return;
                }
            } else {
                switch (position) {
                    case this.POSITION_END:
                        Log.d(this.TAG, "Forcing end of the video");
                        // HACK: use floor because currentTime sometimes can't be set
                        player.currentTime = Math.floor(player.duration);
                        break;
                    case this.POSITION_ONE_SEC:
                        Log.d(this.TAG, "Advance position by one second");
                        player.currentTime = this.advanceTimeSec;
                        break;
                }
            }

            setTimeout(function() {
                YouTubeUtils.playerPlay();
                $this.checkPlayerState(position, onFail);
            }, this.checkTimeoutMS);
        }
    },

    checkPlayerState: function(position, onFail) {
        var $this = this;

        setTimeout(function() {
            var player = YouTubeUtils.getPlayer();

            if (player) {
                Log.d($this.TAG, "Checking player src, position and duration: " + player.src + " " + player.currentTime + " " + player.duration);

                var hasNaN = isNaN(player.currentTime) || isNaN(player.duration);

                var needSeek = false;

                switch (position) {
                    case $this.POSITION_END:
                        needSeek = player.currentTime < player.duration;
                        break;
                    case $this.POSITION_ONE_SEC:
                        needSeek = player.currentTime < $this.advanceTimeSec;
                        break;
                }

                if (YouTubeUtils.isPlayerVisible() && (hasNaN || needSeek)) {
                    Log.d($this.TAG, "Trying to unfreeze the video...");
                    $this.setPosition(position, onFail);
                }
            }
        }, this.checkTimeoutMS);
    }
};