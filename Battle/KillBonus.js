//=============================================================================
// KillBonus.js
// ----------------------------------------------------------------------------
// (C)2016 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.0 2019/06/11 撃破ボーナスとして任意の変数を増減させる機能を追加
// 1.1.0 2017/06/08 ボーナス取得条件としてノーダメージ、ノーデス、ノースキルおよびスイッチを追加
// 1.0.0 2016/08/07 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.2.0 ]敵人擊破獎勵
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help 擊破敵人時可以獲得一些獎勵效果。
 * 可以製作成擊破敵人時回復 HP、MP 的裝備或狀態。
 *
 * 在資料庫中資料的注釋欄中輸入以下內容。
 * <KB_HP:20>          # 自身的 HP 恢復20點。
 * <KB_HPRate:5>       # 自身的 HP 恢復5%。
 * <KB_MP:20>          # 自身的 MP 恢復20點。
 * <KB_MPRate:5>       # 自身的 MP 恢復5%。
 * <KB_TP:20>          # 自身的 TP 恢復20點。
 * <KB_TPRate:5>       # 自身的 TP 恢復5%。
 * <KB_Gold:5>         # 增加金錢 5 G。
 * <KB_State:5>        # 自身賦予狀態 ID[5]。
 * <KB_StateAll:5>     # 我方全體賦予狀態 ID [5]。
 * <KB_StateEnemy:5>   # 敵方全體賦予狀態 ID [5]。
 * <KB_Variable:1, 20> # 變數 [1] 增加 20。
 * <KB_Script:script>  # 任意的 JavaScript 執行。
 *
 * 同時只能附加一個擊破獎勵條件。
 * <KB_Cond:NoDamage>     # 沒有受到傷害的擊破獎勵。
 * <KB_Cond:NoSkill>      # 沒有使用技能的擊破獎勵。
 * <KB_Cond:NoDeath>      # 沒有戰鬥不能的擊破獎勵。
 * <KB_Cond:1>            # 開關 ID [1] 為 ON 時的擊破獎勵。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var metaTagPrefix = 'KB_';

    var getArgNumberWithEval = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(eval(convertEscapeCharacters(arg)), 10) || 0).clamp(min, max);
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getMetaValue = function(object, name) {
        var metaTagName = metaTagPrefix + (name ? name : '');
        return object.meta.hasOwnProperty(metaTagName) ? object.meta[metaTagName] : undefined;
    };

    var getMetaValues = function(object, names) {
        if (!Array.isArray(names)) return getMetaValue(object, names);
        for (var i = 0, n = names.length; i < n; i++) {
            var value = getMetaValue(object, names[i]);
            if (value !== undefined) return value;
        }
        return undefined;
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // BattleManager
    //  スキルやダメージの状況を保持します。
    //=============================================================================
    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.apply(this, arguments);
        $gameParty.members().forEach(function(member) {
            member.initKillBonusCondition();
        });
    };

    //=============================================================================
    // Game_BattlerBase
    //  スキルやダメージの状況を保持します。
    //=============================================================================
    Game_BattlerBase._condNoDamages = ['NoDamage', 'ノーダメージ'];
    Game_BattlerBase._condNoSkill   = ['NoSkill', 'ノースキル'];
    Game_BattlerBase._condNoDeath   = ['NoDeath', 'ノーデス'];

    Game_BattlerBase.prototype.initKillBonusCondition = function() {
        this._noSkill  = true;
        this._noDamage = true;
        this._noDeath  = true;
    };

    Game_BattlerBase.prototype.breakNoSkill = function() {
        this._noSkill  = false;
    };

    Game_BattlerBase.prototype.breakNoDamage = function() {
        this._noDamage  = false;
    };

    Game_BattlerBase.prototype.breakNoDeath = function() {
        this._noDeath  = false;
    };

    Game_BattlerBase.prototype.canAcceptKillBonus = function() {
        return this.traitObjects().every(function(data) {
            return this.checkDataForKillBonus(data);
        }.bind(this));
    };

    Game_BattlerBase.prototype.checkDataForKillBonus = function(data) {
        var condition = getMetaValues(data, ['Cond', '条件']);
        if (!condition) return true;
        if (Game_BattlerBase._condNoDamages.contains(condition) && !this._noDamage) {
            return false;
        }
        if (Game_BattlerBase._condNoSkill.contains(condition) && !this._noSkill) {
            return false;
        }
        if (Game_BattlerBase._condNoDeath.contains(condition) && !this._noDeath) {
            return false;
        }
        var switchId = parseInt(convertEscapeCharacters(condition));
        if (switchId > 0 && !$gameSwitches.value(switchId)) {
            return false;
        }
        return true;
    };

    var _Game_BattlerBase_die = Game_BattlerBase.prototype.die;
    Game_BattlerBase.prototype.die = function() {
        _Game_BattlerBase_die.apply(this, arguments);
        this.breakNoDeath();
    };

    //=============================================================================
    // Game_Battler
    //  ダメージ時にノーダメージフラグを解除します。
    //=============================================================================
    var _Game_Battler_performDamage = Game_Battler.prototype.performDamage;
    Game_Battler.prototype.performDamage = function() {
        _Game_Battler_performDamage.apply(this, arguments);
        this.breakNoDamage();
    };

    //=============================================================================
    // Game_Action
    //  撃破ボーナスを適用します。
    //=============================================================================
    var _Game_Action_testApply = Game_Action.prototype.testApply;
    Game_Action.prototype.testApply = function(target) {
        var result = _Game_Action_testApply.apply(this, arguments);
        if (result && !this.isAttack() && !this.isGuard()) {
            this.subject().breakNoSkill();
        }
        return result;
    };

    var _Game_Action_executeHpDamage      = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        _Game_Action_executeHpDamage.apply(this, arguments);
        if (target.hp === 0) this.executeKillBonus();
    };

    Game_Action.prototype.executeKillBonus = function() {
        var subject = this.subject();
        if (!subject || !subject.canAcceptKillBonus()) return;
        this._gainHp = 0;
        this._gainMp = 0;
        this._gainTp = 0;
        subject.traitObjects().forEach(function(data) {
            this.executeKillBonusRecoverHp(data, subject);
            this.executeKillBonusRecoverMp(data, subject);
            this.executeKillBonusRecoverTp(data, subject);
            this.executeKillBonusGold(data, subject);
            this.executeKillBonusState(data, subject);
            this.executeKillBonusStateAll(data, subject);
            this.executeKillBonusStateEnemy(data, subject);
            this.executeKillBonusVariable(data, subject);
            this.executeKillBonusScript(data, subject);
        }.bind(this));
        if (this._gainHp !== 0) subject.gainHp(this._gainHp);
        if (this._gainMp !== 0) subject.gainMp(this._gainMp);
        if (this._gainTp !== 0) subject.gainTp(this._gainTp);
    };

    Game_Action.prototype.executeKillBonusRecoverHp = function(data, subject) {
        var value = getMetaValue(data, 'HP');
        if (value) this._gainHp += getArgNumberWithEval(value);
        var value2 = getMetaValue(data, 'HPRate');
        if (value2) this._gainHp += Math.floor(subject.mhp * getArgNumberWithEval(value2) / 100);
    };

    Game_Action.prototype.executeKillBonusRecoverMp = function(data, subject) {
        var value = getMetaValue(data, 'MP');
        if (value) this._gainMp += getArgNumberWithEval(value);
        var value2 = getMetaValue(data, 'MPRate');
        if (value2) this._gainMp += Math.floor(subject.mmp * getArgNumberWithEval(value2) / 100);
    };

    Game_Action.prototype.executeKillBonusRecoverTp = function(data, subject) {
        var value = getMetaValue(data, 'TP');
        if (value) this._gainTp += getArgNumberWithEval(value);
        var value2 = getMetaValue(data, 'TPRate');
        if (value2) this._gainTp += Math.floor(subject.maxTp() * getArgNumberWithEval(value2) / 100);
    };

    Game_Action.prototype.executeKillBonusGold = function(data, subject) {
        var value = getMetaValues(data, ['Gold', 'お金']);
        if (value) {
            $gameParty.gainGold(getArgNumberWithEval(value));
        }
    };

    Game_Action.prototype.executeKillBonusVariable = function(data, subject) {
        var value = getMetaValues(data, ['Variable', '変数']);
        if (value) {
            var args = getArgString(value).split(',');
            var id = parseInt(args[0]);
            $gameVariables.setValue(id, $gameVariables.value(id) + parseInt(args[1]) || 0);
        }
    };

    Game_Action.prototype.executeKillBonusState = function(data, subject) {
        var value = getMetaValues(data, ['State', 'ステート']);
        if (value) {
            subject.addState(getArgNumberWithEval(value));
        }
    };

    Game_Action.prototype.executeKillBonusStateAll = function(data, subject) {
        var value = getMetaValues(data, ['StateAll', 'ステート全体']);
        if (value) {
            subject.friendsUnit().members().forEach(function(member) {
                member.addState(getArgNumberWithEval(value));
            });
        }
    };

    Game_Action.prototype.executeKillBonusStateEnemy = function(data, subject) {
        var value = getMetaValues(data, ['StateEnemy', 'ステート敵']);
        if (value) {
            subject.opponentsUnit().members().forEach(function(member) {
                member.addState(getArgNumberWithEval(value));
            });
        }
    };

    Game_Action.prototype.executeKillBonusScript = function(data, subject) {
        var value = getMetaValues(data, ['Script', 'スクリプト']);
        if (value) {
            try {
                eval(getArgString(value));
            } catch (e) {
                console.log(e.stack);
            }
        }
    };
})();

