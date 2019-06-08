//=============================================================================
// AnotherNewGame.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.4.0 2017/06/18 アナザーニューゲームの追加位置を指定できる機能を追加
// 1.3.0 2017/05/27 ニューゲームを非表示にできる機能を追加
// 1.2.4 2017/05/23 プラグインコマンドのヘルプを修正
// 1.2.3 2017/01/25 同一サーバで同プラグインを適用した複数のゲームを公開する際に、設定が重複するのを避けるために管理番号を追加
// 1.2.2 2016/12/10 アナザーニューゲームをロードした際に、ロード元でイベントが実行中だった場合に続きが実行されてしまう現象を修正
// 1.2.1 2016/11/23 遠景タイトルプラグイン（ParallaxTitle.js）と連携する設定を追加
// 1.2.0 2016/11/22 アナザーニューゲームを選択した際に、フェードアウトしなくなる設定を追加
// 1.1.0 2016/03/29 fftfanttさんからご提供いただいたコードを反映させ、アナザーニューゲーム選択時に
//                  既存のセーブファイルをロードする機能を追加
// 1.0.1 2015/11/10 プラグイン適用中にセーブできなくなる不具合を修正
// 1.0.0 2015/11/07 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 添加新遊戲選項插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param name
 * @text 命令名稱
 * @desc 顯示在標題畫面上的命令名稱。
 * @default Another New Game
 *
 * @param map_id
 * @text 地圖ID
 * @desc 目標地圖ID。
 * @default 1
 *
 * @param map_x
 * @text 地圖 X 座標
 * @desc 目標地圖的 X 座標。
 * @default 1
 *
 * @param map_y
 * @text 地圖 Y 座標
 * @desc 目標地圖的 Y 座標。
 * @default 1
 *
 * @param hidden
 * @text 隱藏選項
 * @desc 默認情況下，隱藏選項。可以使用插件命令控制。（ON/OFF）
 * @default OFF
 *
 * @param disable
 * @text 禁用選項
 * @desc 默認情況下，禁用選擇選項。可以使用插件命令控制。（ON/OFF）
 * @default OFF
 *
 * @param file_load
 * @text 讀取檔案
 * @desc 選擇新遊戲選項後，可以通過讀取畫面來載入現有的已保存檔案。（ON/OFF）
 * @default OFF
 *
 * @param no_fadeout
 * @text 場景不淡出
 * @desc 當選擇新遊戲選項時，音樂和畫面不會淡出。（ON/OFF）
 * @default OFF
 *
 * @param manage_number
 * @text 管理編號
 * @desc 在同一台伺服器上發布多個遊戲時，請為每個遊戲設置不同的值。（RPGazumar不包括在內）
 * @default
 *
 * @param add_position
 * @text 添加位置
 * @desc 這是添加的新遊戲選項位置。（1：新遊戲的上面，2：讀取的上面，3：設置的上面）
 * @default 0
 *
 * @help 將添加新遊戲選項到標題畫面窗口。
 * 如果選擇這個選項，將直接從指定目標地圖開始新遊戲，與原本開始遊戲可分開。
 * 可製作特典和CG回憶模式，素材註記，迷你游戲，隱藏元素等額外要素。
 * 根據用戶的需求，可用於各種用途。
 *
 * 可以預先隱藏或選擇禁止選項。
 * 這些可以從插件命令中取消，釋放狀態是保存文件
 * 它在整個遊戲中共享。也可以再次禁用取消狀態。
 *
 * 插件命令詳細訊息
 *   從事件中的「插件命令」執行。
 *
 *  ANG_VISIBLE  # 顯示添加的新遊戲選項。
 *  ANG_ENABLE   # 使添加的新遊戲選項可以選擇。
 *  ANG_HIDDEN   # 隱藏添加的新遊戲選項。
 *  ANG_DISABLE  # 禁用選擇添加的新遊戲選項。
 *  ANG_NEWGAME_HIDDEN  # 隱藏原本的開始遊戲。
 *  ANG_NEWGAME_VISIBLE # 顯示原本的開始遊戲。
 *
 * 使用範例（當新遊戲選項設置為「顯示」的情況）
 * ANG_VISIBLE
 *
 * 原本的開始遊戲隱藏的功能有可能導致遊戲無法開始。
 * 使用上必須小心。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
(function() {
    var parameters      = PluginManager.parameters('AnotherNewGame');
    var localExtraStage = false;

    var getArgBoolean = function(arg) {
        return arg.toUpperCase() === 'ON';
    };

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンド[ANG_VISIBLE]などを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        switch (command.toUpperCase()) {
            case 'ANG_VISIBLE' :
                ANGSettingManager.visible = true;
                ANGSettingManager.save();
                break;
            case 'ANG_ENABLE' :
                ANGSettingManager.enable = true;
                ANGSettingManager.save();
                break;
            case 'ANG_HIDDEN' :
                ANGSettingManager.visible = false;
                ANGSettingManager.save();
                break;
            case 'ANG_DISABLE' :
                ANGSettingManager.enable = false;
                ANGSettingManager.save();
                break;
            case 'ANG_NEWGAME_HIDDEN' :
                ANGSettingManager.newGameHidden = true;
                ANGSettingManager.save();
                break;
            case 'ANG_NEWGAME_VISIBLE' :
                ANGSettingManager.newGameHidden = false;
                ANGSettingManager.save();
                break;
        }
    };

    //=============================================================================
    // Game_Map
    //  アナザーニューゲームのロード時に実行していたイベントを中断します。
    //=============================================================================
    Game_Map.prototype.abortInterpreter = function() {
        if (this.isEventRunning()) {
            this._interpreter.command115();
        }
    };

    //=============================================================================
    // Scene_Title
    //  アナザーニューゲームの選択時の処理を追加定義します。
    //=============================================================================
    var _Scene_Title_create      = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        this.loadAngSetting();
        _Scene_Title_create.call(this);
    };

    var _Scene_Title_commandContinue      = Scene_Title.prototype.commandContinue;
    Scene_Title.prototype.commandContinue = function() {
        _Scene_Title_commandContinue.call(this);
        localExtraStage = false;
    };

    Scene_Title.prototype.loadAngSetting = function() {
        ANGSettingManager.loadData();
    };

    var _Scene_Title_commandNewGameSecond      = Scene_Title.prototype.commandNewGameSecond;
    Scene_Title.prototype.commandNewGameSecond = function() {
        if (_Scene_Title_commandNewGameSecond) _Scene_Title_commandNewGameSecond.apply(this, arguments);
        if (getArgBoolean(parameters['no_fadeout'] || '')) {
            this._noFadeout = true;
        }
        if (!getArgBoolean(parameters['file_load'] || '')) {
            var preMapId           = $dataSystem.startMapId;
            var preStartX          = $dataSystem.startX;
            var preStartY          = $dataSystem.startY;
            $dataSystem.startMapId = parseInt(parameters['map_id'], 10) || 1;
            $dataSystem.startX     = parseInt(parameters['map_x'], 10) || 1;
            $dataSystem.startY     = parseInt(parameters['map_y'], 10) || 1;
            this.commandNewGame();
            $dataSystem.startMapId = preMapId;
            $dataSystem.startX     = preStartX;
            $dataSystem.startY     = preStartY;
        } else {
            this.commandContinue();
            localExtraStage = true;
        }
    };

    var _Scene_Title_createCommandWindow      = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        if (ANGSettingManager.visible)
            this._commandWindow.setHandler('nameGame2', this.commandNewGameSecond.bind(this));
    };

    Scene_Title.prototype.fadeOutAll = function() {
        if (!this._noFadeout) {
            Scene_Base.prototype.fadeOutAll.apply(this, arguments);
        }
    };

    //=============================================================================
    // Scene_Load
    //  ロード成功時にアナザーポイントに移動します。
    //=============================================================================
    var _Scene_Load_onLoadSuccess      = Scene_Load.prototype.onLoadSuccess;
    Scene_Load.prototype.onLoadSuccess = function() {
        _Scene_Load_onLoadSuccess.call(this);
        if (localExtraStage) {
            var mapId = parseInt(parameters['map_id'], 10) || 1;
            var x     = parseInt(parameters['map_x'], 10) || 1;
            var y     = parseInt(parameters['map_y'], 10) || 1;
            $gamePlayer.reserveTransfer(mapId, x, y);
            $gameMap.abortInterpreter();
            DataManager.selectSavefileForNewGame();
        }
    };

    //=============================================================================
    // Window_TitleCommand
    //  アナザーニューゲームの選択肢を追加定義します。
    //=============================================================================
    var _Window_TitleCommand_makeCommandList      = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        if (ANGSettingManager.visible) {
            this.addCommand(parameters['name'], 'nameGame2', ANGSettingManager.enable);
            var addPosition = parseInt(parameters['add_position'], 10);
            if (addPosition > 0) {
                var anotherCommand = this._list.pop();
                this._list.splice(addPosition - 1, 0, anotherCommand);
            }
        }
        if (ANGSettingManager.newGameHidden) {
            this.eraseCommandNewGame();
        }
    };

    Window_TitleCommand.prototype.eraseCommandNewGame = function() {
        this._list = this._list.filter(function(command) {
            return command.symbol !== 'newGame';
        })
    };

    var _Window_TitleCommand_updatePlacement      = Window_TitleCommand.prototype.updatePlacement;
    Window_TitleCommand.prototype.updatePlacement = function() {
        _Window_TitleCommand_updatePlacement.call(this);
        if (ANGSettingManager.visible) this.y += this.height / 8;
    };

    //=============================================================================
    // ANGManager
    //  アナザーニューゲームの設定ファイルのセーブとロードを定義します。
    //=============================================================================
    function ANGSettingManager() {
        throw new Error('This is a static class');
    }
    ANGSettingManager._fileId = -1001;

    ANGSettingManager.visible       = false;
    ANGSettingManager.enable        = false;
    ANGSettingManager.newGameHidden = false;

    ANGSettingManager.make = function() {
        var info           = {};
        info.visible       = this.visible;
        info.enable        = this.enable;
        info.newGameHidden = this.newGameHidden;
        return info;
    };

    ANGSettingManager.loadData = function() {
        var info           = this.load();
        this.visible       = (info['visible'] !== undefined ? info['visible'] : !getArgBoolean(parameters['hidden']));
        this.enable        = (info['enable'] !== undefined ? info['enable'] : !getArgBoolean(parameters['disable']));
        this.newGameHidden = info['newGameHidden'] || false;
    };

    ANGSettingManager.load = function() {
        var json;
        try {
            json = StorageManager.load(this._fileId);
        } catch (e) {
            console.error(e);
            return [];
        }
        if (json) {
            return JSON.parse(json);
        } else {
            return [];
        }
    };

    ANGSettingManager.save = function() {
        var info = ANGSettingManager.make();
        StorageManager.save(this._fileId, JSON.stringify(info));
    };

    //=============================================================================
    // StorageManager
    //  アナザーニューゲームの設定ファイルのパス取得処理を追加定義します。
    //=============================================================================
    var _StorageManager_localFilePath = StorageManager.localFilePath;
    StorageManager.localFilePath      = function(savefileId) {
        if (savefileId === ANGSettingManager._fileId) {
            return this.localFileDirectoryPath() + 'AnotherNewGame.rpgsave';
        } else {
            return _StorageManager_localFilePath.call(this, savefileId);
        }
    };

    var _StorageManager_webStorageKey = StorageManager.webStorageKey;
    StorageManager.webStorageKey      = function(savefileId) {
        if (savefileId === ANGSettingManager._fileId) {
            return 'RPG AnotherNewGame' + parameters['manage_number'];
        } else {
            return _StorageManager_webStorageKey.call(this, savefileId);
        }
    };
})();
