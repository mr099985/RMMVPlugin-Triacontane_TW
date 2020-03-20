//=============================================================================
// ParallelParty.js
// ----------------------------------------------------------------------------
// (C) 2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.3.0 2019/01/02 用語辞典プラグイン使用時に用語履歴を常に継承できるよう修正
// 1.2.1 2017/12/08 SceneGlossary.jsとの間で発生する可能性のある競合を解消
// 1.2.0 2017/05/15 パーティを切り替えた際にリソースを統合できる機能を追加
// 1.1.0 2017/05/13 パーティ間でリソースを共有する設定を追加、各パーティのマップ座標を記憶して自働で場所移動する機能を追加
// 1.0.0 2017/05/09 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 複數隊伍管理
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param ShareResource
 * @text 隊伍資源共享
 * @desc 在不同隊伍中分享資源（物品，武器，盔甲，金錢，步數）。(ON/OFF)
 * @default OFF
 *
 * @param SavePosition
 * @text 保存位置
 * @desc 切換方時保存原始位置，並在返回原始方時自動移動位置。
 * @default OFF
 *
 * @help 同時管理複數個隊伍。
 * 各隊伍使用「隊伍ID」來管理，初期隊伍的 ID 為 0 。
 * 每個隊伍擁有的資金和項目都是單獨管理的，
 * 可以用插件命令替換另一方。
 *
 * 移動到新隊伍後，因為成員是 0 人的狀態，
 * 所以請用事件命令「更改隊伍成員」來添加角色。
 *
 * 角色訊息是共享的，因此如果將原隊伍角色放到另一方隊伍，
 * 將會繼承該狀態。
 *
 * 不能在戰鬥中改變隊伍。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * PP_CHANGE_PARTY 1 OFF # 將隊伍更改為[1]。
 * PP_CHANGE_PARTY 1 ON  # 將隊伍更改為[1]並整合資源。
 *
 * 當資源整合開啟時，我們將所擁有的物品和金錢與加入的一方合併。
 * 當單獨行動的多方合併為一方時使用。
 * 如果 ShareResource 參數有效，則不會進行合併。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

function Game_Parties() {
    this.initialize.apply(this, arguments);
}

(function() {
    'use strict';
    var pluginName    = 'ParallelParty';
    var metaTagPrefix = 'PP_';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return '';
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return value.toUpperCase() === 'ON';
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(arg) || 0).clamp(min, max);
    };

    var getArgBoolean = function(arg) {
        return arg.toUpperCase() === 'ON';
    };

    var convertEscapeCharacters = function(text) {
        if (isNotAString(text)) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    var isNotAString = function(args) {
        return String(args) !== args;
    };

    var convertAllArguments = function(args) {
        for (var i = 0; i < args.length; i++) {
            args[i] = convertEscapeCharacters(args[i]);
        }
        return args;
    };

    var setPluginCommand = function(commandName, methodName) {
        pluginCommandMap.set(metaTagPrefix + commandName, methodName);
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var pluginCommandMap = new Map();
    setPluginCommand('パーティ変更', 'execChangeParty');
    setPluginCommand('CHANGE_PARTY', 'execChangeParty');

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param           = {};
    param.shareResource = getParamBoolean(['ShareResource', 'リソース共有']);
    param.savePosition  = getParamBoolean(['SavePosition', 'パーティ位置を保持']);

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var pluginCommandMethod = pluginCommandMap.get(command.toUpperCase());
        if (pluginCommandMethod) {
            this[pluginCommandMethod](convertAllArguments(args));
        }
    };

    Game_Interpreter.prototype.execChangeParty = function(args) {
        if ($gameParty.inBattle()) return;
        $gameSystem.changeParty(getArgNumber(args[0], 0), getArgBoolean(args[1] || ''));
        if (!$gamePlayer.isTransferring()) {
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
        } else {
            this.setWaitMode('transfer');
        }
    };

    //=============================================================================
    // Game_System
    //  Game_Partiesを生成します。
    //=============================================================================
    Game_System.prototype.changeParty = function(partyId, resourceCombine) {
        if (!this._parties) {
            this._parties = new Game_Parties();
        }
        this._parties.change(partyId, resourceCombine);
    };

    //=============================================================================
    // Game_Party
    //  リソースの引き継ぎと位置の保存を追加定義します。
    //=============================================================================
    Game_Party.prototype.getAllResources = function() {
        return {
            items        : this._items,
            weapons      : this._weapons,
            armors       : this._armors,
            gold         : this._gold,
            steps        : this._steps,
            itemHistory  : this._itemHistory,
            weaponHistory: this._weaponHistory,
            armorHistory : this._armorHistory
        };
    };

    Game_Party.prototype.inheritAllResources = function(prevParty) {
        var resources = prevParty.getAllResources();
        this._items   = resources.items;
        this._weapons = resources.weapons;
        this._armors  = resources.armors;
        this._gold    = resources.gold;
        this._steps   = resources.steps;
        this.inheritItemHistory(prevParty);
    };

    Game_Party.prototype.combineAllResources = function(targetParty) {
        var resources = targetParty.getAllResources();
        Object.keys(resources.items).forEach(function(id) {
            this.gainItem($dataItems[id], resources.items[id], false);
        }, this);
        Object.keys(resources.weapons).forEach(function(id) {
            this.gainItem($dataWeapons[id], resources.weapons[id], false);
        }, this);
        Object.keys(resources.armors).forEach(function(id) {
            this.gainItem($dataArmors[id], resources.armors[id], false);
        }, this);
        this.gainGold(resources.gold);
        this._steps += resources.steps;
        $gameParty.initAllItems();
        $gameParty.loseGold($gameParty.maxGold());
        $gameParty._steps = 0;
    };

    // for SceneGlossary.js
    Game_Party.prototype.inheritItemHistory = function(prevParty) {
        var resources       = prevParty.getAllResources();
        this._itemHistory   = resources.itemHistory;
        this._weaponHistory = resources.weaponHistory;
        this._armorHistory  = resources.armorHistory;
    };

    Game_Party.prototype.moveSavedPosition = function() {
        if (!this._savedMapId) return;
        $gamePlayer.reserveTransfer(this._savedMapId, this._savedX, this._savedY, this._savedDirection, 2);
    };

    Game_Party.prototype.savePosition = function() {
        this._savedMapId     = $gameMap.mapId();
        this._savedX         = $gamePlayer.x;
        this._savedY         = $gamePlayer.y;
        this._savedDirection = $gamePlayer.direction();
    };

    //=============================================================================
    // Game_Parties
    //  複数のパーティを管理します。
    //=============================================================================
    Game_Parties.prototype.initialize = function() {
        this._data    = [$gameParty];
        this._partyId = 0;
    };

    Game_Parties.prototype.createPartyIfNeed = function() {
        if (!this.isExistParty()) {
            this._data[this._partyId] = new Game_Party();
        }
    };

    Game_Parties.prototype.isExistParty = function() {
        return !!this.getCurrentParty();
    };

    Game_Parties.prototype.getCurrentParty = function() {
        return this._data[this._partyId];
    };

    Game_Parties.prototype.change = function(partyId, resourceCombine) {
        if (this._partyId === partyId) return;
        this._partyId = partyId;
        this.createPartyIfNeed();
        var currentParty = this.getCurrentParty();
        if (param.shareResource) {
            currentParty.inheritAllResources($gameParty);
        } else if (resourceCombine) {
            currentParty.combineAllResources($gameParty);
        } else {
            currentParty.inheritItemHistory($gameParty);
        }
        if (param.savePosition) {
            this.moveSavedPosition();
        }
        $gameParty = currentParty;
    };

    Game_Parties.prototype.moveSavedPosition = function() {
        $gameParty.savePosition();
        var currentParty = this.getCurrentParty();
        currentParty.moveSavedPosition();
    };
})();

