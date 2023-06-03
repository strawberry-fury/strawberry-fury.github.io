(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
  })((function () { 'use strict';
  
    var version$1 = "0.0.0";
  
    /* rewriteCode(targetFunction, pattern1, replacement1, pattern2, replacement2, ...)
     *
     * Rewrites the source code of the target function,
     * according to the provided list of pattern and replacements.
     * `pattern` and `replacement` are the first and second arguments to String.prototype.replace.
     * The altered function is returned.
     */
    function rewriteCode(targetFunction, ...args) {
        let code = targetFunction.toString();
        let patterns = args.filter((_, i) => i % 2 == 0);
        let replacements = args.filter((_, i) => i % 2 == 1);
        for (let i = 0; i < replacements.length; i++) {
            if (replacements[i] instanceof RegExp) {
                throw new Error(`replacements[${i}] may not be a RegExp`);
                // TODO: improve interface for this function
            }
            else {
                code = code.replace(patterns[i], replacements[i]);
            }
        }
        return (new Function('return ' + code))();
    }

    /* Discrepancy patch.
     */
    /* Patches the discrepancy.
     * For ease of use, this function bails out if Spice.settings.patchDiscrepancy is false,
     * so it is safe to call this function at all times.
     */
    function patchDiscrepancy() {
        // This function is run on init and on load
        /* Since Orteil's code is sensitive to timing issues,
         * patching it changes the behavior of game loads,
         * so I think it is safer to leave it as an explicit opt-in feature.
         */
        Game.loadLumps = rewriteCode(Game.loadLumps, 'Game.lumpT=Date.now()-(age-amount*Game.lumpOverripeAge);', '// Game.lumpT += amount*Game.lumpOverripeAge; // Spiced cookies patch');
        // We shift the responsibility of updating Game.lumpT to Game.harvestLumps
        Game.harvestLumps = rewriteCode(Game.harvestLumps, 'Game.lumpT=Date.now();', `let harvestedAmount = Math.floor((Date.now() - Game.lumpT)/Game.lumpOverripeAge);
          if(harvestedAmount > 0) {
              Game.lumpT += Game.lumpOverripeAge * harvestedAmount;
          } // Spiced cookies patch
      `);
        // Now we have to patch clickLump, because harvestLumps wouldn't change lump time in this case
        Game.clickLump = rewriteCode(Game.clickLump, /Game.computeLumpType\(\);/g, `Game.lumpT = Date.now(); // Spiced cookies patch
          Game.computeLumpType();
      `);
    }

  
    /* Function that creates the version-history-appender in the Info menu.
     */
    function addVersionHistory() {
        // Run on Spice.init()
        let str = `
      <div class="listing">
          <a href="https://github.com/staticvariablejames/SpicedCookies" target="blank">Spiced Cookies</a>
          Custom Mod by strawberryfury to only patch discrepancy - As of v2.052 the original mod is broken.
          
      </div>
  
      `;
        Game.customInfoMenu.push(function () {
            CCSE.PrependCollapsibleInfoMenu(name, str);
        });
    }
  
    /* Defines the metadata used e.g. in `Game.registerMod`.
     */
    const name = "Spice [Discrepancy Patch]";
    const version = version$1;
    const GameVersion = "2.052";
    const CCSEVersion = "2.052";
    let isLoaded = false;
    function save() {
        // Run the save game functions
        return JSON.stringify({version });
    }
    function load(str) {
        patchDiscrepancy();
    }
    function init() {
        isLoaded = true;
        // Info menu
        addVersionHistory();
        Game.Notify('Discrepancy Patch loaded!', '', undefined, 1, true);
    }
  
    /* The exports of this file construct the "Spice" object.
     */
  
    var SpiceD = {
      __proto__: null,
      name: name,
      version: version,
      GameVersion: GameVersion,
      CCSEVersion: CCSEVersion,
      get isLoaded () { return isLoaded; },
      save: save,
      load: load,
      init: init,
      rewriteCode: rewriteCode,
      patchDiscrepancy: patchDiscrepancy,

    };
  
    /* This file makes sure that CCSE loads,
     * that Spice is available as a global object,
     * and `Game.registerMod`s it.
     */
    window.SpiceD = SpiceD;
    if (typeof CCSE == 'undefined')
        Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
    if (!isLoaded) {
        let id = 'DiscrepancyFix';
        if (window.CCSE && window.CCSE.isLoaded) {
            Game.registerMod(id, SpiceD);
        }
        else {
            if (!window.CCSE)
                window.CCSE = {};
            if (!window.CCSE.postLoadHooks)
                window.CCSE.postLoadHooks = [];
            window.CCSE.postLoadHooks.push(function () {
                if (window.CCSE.ConfirmGameVersion(name, version, GameVersion)) {
                    Game.registerMod(id, SpiceD);
                }
            });
        }
    }
  }));
