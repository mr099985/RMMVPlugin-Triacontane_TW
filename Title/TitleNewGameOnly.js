//=============================================================================
// TitleNewGameOnly.js
// ----------------------------------------------------------------------------
// (C)2015-2018 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.1.0 2018/12/01 スタート文字列のY座標を調整できるようにしました。
// 2.0.0 2017/03/01 セーブファイルが存在する場合の動作を3通りから選択できる機能を追加
// 1.3.0 2017/06/12 型指定機能に対応
// 1.2.0 2016/12/25 専用のスタート効果音を設定できる機能を追加
// 1.1.0 2016/03/10 セーブが存在する場合、通常のウィンドウを開く機能を追加
// 1.0.1 2015/11/01 既存コードの再定義方法を修正（内容に変化なし）
// 1.0.0 2015/10/31 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.2.1.0 ]讓標題畫面直接開始遊戲
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param startString
 * @text 開始遊戲文字
 * @desc 開始遊戲所顯示的提示文字。
 * @default -Press Start-
 *
 * @param font
 * @text 字體
 * @desc 開始遊戲文字的字體名稱。(僅在指定字體時有效果)
 * @default
 * @type struct<Font>
 *
 * @param fileExistAction
 * @text 檔案存在時的動作
 * @desc 當有存檔存在的情況下選擇執行動作。
 * @default 0
 * @type select
 * @option 0 : 無條件直接開始遊戲。
 * @value 0
 * @option 1 : 通常的選擇窗口顯示。
 * @value 1
 * @option 2 : 自動讀取最新的存檔。
 * @value 2
 *
 * @param soundEffect
 * @text 開始遊戲 SE
 * @desc 開始遊戲的指定 SE 。未指定的情況使用系統 SE 播放。
 * @default
 * @type struct<AudioSe>
 *
 * @param adjustY
 * @text Y 座標校正值
 * @desc 開始遊戲文字顯示的 Y 座標校正
 * @default 0
 * @min -9999
 * @max 9999
 * @type number
 *
 * @help 在標題畫面僅顯示開始遊戲。
 * 決定鍵按下或是點擊畫面都會直接開始遊戲。
 * 利用於短篇不需存檔概念的遊戲。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

/*~struct~AudioSe:
 * @param name
 * @text 檔案名稱
 * @desc 音效文件名稱
 * @default
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume
 * @text 音量
 * @desc 音量
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @param pitch
 * @text 音調
 * @desc 音調
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @param pan
 * @text 左右聲道
 * @desc 左右聲道
 * @default 0
 * @type number
 * @min -100
 * @max 100
 */

/*~struct~Font:
 * @param name
 * @text 字體名稱
 * @desc 字體名。不指定的情況下留空
 * @default
 *
 * @param size
 * @text 文字大小
 * @desc 文字大小
 * @default 53
 * @type number
 *
 * @param bold
 * @text 是否粗體
 * @desc 是否粗體
 * @default false
 * @type boolean
 *
 * @param italic
 * @text 是否斜體
 * @desc 是否斜體
 * @default false
 * @type boolean
 *
 * @param color
 * @text 文字顏色
 * @desc 文字顏色
 * @default rgba(255,255,255,1.0)
 */

(function() {

    /**
     * Create plugin parameter. param[paramName] ex. param.commandPrefix
     * @param pluginName plugin name(EncounterSwitchConditions)
     * @returns {Object} Created parameter
     */
    var createPluginParameter = function(pluginName) {
        var paramReplacer = function(key, value) {
            if (value === 'null') {
                return value;
            }
            if (value[0] === '"' && value[value.length - 1] === '"') {
                return value;
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        };
        var parameter     = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager.setParameters(pluginName, parameter);
        return parameter;
    };

    var param = createPluginParameter('TitleNewGameOnly');

    //=============================================================================
    // Scene_Title
    //  コマンドウィンドウを無効化し、代わりにゲームスタート文字列を表示させます。
    //=============================================================================
    var _Scene_TitleCreate       = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_TitleCreate.apply(this, arguments);
        this._commandWindow.setHandler('cancel', this.onCancelCommand.bind(this));
        this.createGameStartSprite();
        this.onCancelCommand();
    };

    var _Scene_TitleUpdate       = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_TitleUpdate.apply(this, arguments);
        this.updateNewGameOnly();
    };

    var _Scene_Title_terminate      = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        _Scene_Title_terminate.apply(this, arguments);
        if (this._sceneLoad) {
            this._sceneLoad.terminate();
        }
    };

    Scene_Title.prototype.updateNewGameOnly = function() {
        if (this._commandWindowClose) {
            this._commandWindow.openness -= 64;
        }
        if (!this._seledted && this.isTriggered()) {
            this.commandNewGameOnly();
        }
    };

    Scene_Title.prototype.commandNewGameOnly = function() {
        this.playStartSe();
        if (this.isContinueEnabled()) {
            if (param.fileExistAction === 2) {
                var result      = DataManager.loadGame(DataManager.latestSavefileId());
                this._sceneLoad = new Scene_Load();
                if (result) {
                    this._sceneLoad.onLoadSuccess();
                    this.fadeOutAll();
                } else {
                    this._sceneLoad.onLoadFailure();
                }
            } else {
                this._commandWindow.activate();
                this._gameStartSprite.visible = false;
                this._commandWindowClose      = false;
                this._commandWindow.visible   = true;
            }
        } else {
            this._gameStartSprite.opacity_shift *= 16;
            this.commandNewGame();
        }
        this._seledted = true;
    };

    Scene_Title.prototype.playStartSe = function() {
        if (param.soundEffect) {
            AudioManager.playSe(param.soundEffect);
        } else {
            SoundManager.playOk();
        }
    };

    Scene_Title.prototype.onCancelCommand = function() {
        this._commandWindow.deactivate();
        this._seledted                = false;
        this._gameStartSprite.visible = true;
        this._commandWindowClose      = true;
        this._commandWindow.visible   = false;
    };

    Scene_Title.prototype.isContinueEnabled = function() {
        return param.fileExistAction > 0 && DataManager.isAnySavefileExists();
    };

    Scene_Title.prototype.createGameStartSprite = function() {
        this._gameStartSprite = new Sprite_GameStart();
        this._gameStartSprite.draw();
        this.addChild(this._gameStartSprite);
    };

    Scene_Title.prototype.isTriggered = function() {
        return Object.keys(Input.keyMapper).some(function(keyCode) {
                return Input.isTriggered(Input.keyMapper[keyCode]);
            }.bind(this)) ||
            Object.keys(Input.gamepadMapper).some(function(keyCode) {
                return Input.isTriggered(Input.gamepadMapper[keyCode]);
            }.bind(this)) || TouchInput.isTriggered();
    };

    //=============================================================================
    // Sprite_GameStart
    //  ゲームスタート文字列を描画するスプライトを表示します。
    //=============================================================================
    function Sprite_GameStart() {
        this.initialize.apply(this, arguments);
    }

    Sprite_GameStart.DEFALT_FONT = {size: 52, bold: false, italic: true, color: 'rgba(255,255,255,1.0)'};

    Sprite_GameStart.prototype             = Object.create(Sprite_Base.prototype);
    Sprite_GameStart.prototype.constructor = Sprite_GameStart;

    Sprite_GameStart.prototype.initialize = function() {
        Sprite_Base.prototype.initialize.call(this);
        this.y             = Graphics.height - 160 + (param.adjustY || 0);
        this.opacity_shift = -2;
    };

    Sprite_GameStart.prototype.draw = function() {
        var font    = param.font || Sprite_GameStart.DEFALT_FONT;
        this.bitmap = new Bitmap(Graphics.width, font.size);
        if (font.name) {
            this.bitmap.fontFace = fontFace;
        }
        this.bitmap.fontSize   = font.size;
        this.bitmap.fontItalic = font.italic;
        this.bitmap.fontBold   = font.bold;
        this.bitmap.textColor  = font.color;
        this.bitmap.drawText(param.startString, 0, 0, Graphics.width, font.size, 'center');
    };

    Sprite_GameStart.prototype.update = function() {
        this.opacity += this.opacity_shift;
        if (this.opacity <= 128 || this.opacity >= 255) this.opacity_shift *= -1;
    };
})();
