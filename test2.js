Game.registerMod('HoldClicker', {
    condition: {
        mouseDown: false,
        mouseHover: false,
    },

    config: {
        speed: 30,
    },

    interval: undefined,

    init: function() {
        console.log(this)
        // Game.customOptionsMenu.push(this.addOptionsMenu);
        this.conditionDetect();
    },

    load: function(str) {
        const config = JSON.parse(str);
        for(const c in config) this.config[c] = config[c];
    },

    save: function() {
        return JSON.stringify(this.config);
    },

    conditionDetect: function() {
        const mod = this
        document.body.onmousedown = function(e) {
            if (e.button == 0) {
                mod.condition.mouseDown = true
                mod.clicker(mod)
            }
        }
        document.body.onmouseup = function(e) {
            if (e.button == 0) {
                mod.condition.mouseDown = false
                mod.clicker(mod)
            }
        }
        document.getElementById('bigCookie').addEventListener('mouseover', function () {
            mod.condition.mouseHover = true
            mod.clicker(mod)
        });
        document.getElementById('bigCookie').addEventListener('mouseout', function () {
            mod.condition.mouseHover = false
            mod.clicker(mod)
        });
    },

    clicker: function (mod) {
        if (mod.condition.mouseDown && mod.condition.mouseHover) {
            mod.interval = setInterval(function () {Game.ClickCookie(0)}, 1000/mod.config.speed);
        } else {
            clearInterval(mod.interval);
        }
    }
});
