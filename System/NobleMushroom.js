//=============================================================================
// NobleMushroom.js
// ----------------------------------------------------------------------------
// (C) 2016 DOWANGO Co., Ltd
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.7.3 2018/12/14 ロード、クイックロード時に決定ボタンを押し続けているとロード処理が繰り返されてしまう問題を修正
//                  アイコン画像が自動改行時に考慮されない問題を修正
// 1.7.2 2018/09/25 MessageSkip.jsと組み合わせたときにオート待機フレームの際に取得するテキスト文字数が正しく取得できていなかった競合を解消
// 1.7.1 2017/12/30 相対フォントサイズにマイナス値を設定しても反映されなかった問題を修正
// 1.7.0 2017/12/17 ノベルメッセージの縦書きの対応
// 1.6.1 2017/10/29 場所移動のフェードアウト中にポーズメニューを押下すると、移動後にイベントが進まなくなる不具合を修正
// 1.6.0 2017/10/07 自動改行が有効な場合、自動改行位置と入力した改行が重なったときに2回改行されてしまう問題を修正
//                  パラメータの型指定機能に対応
// 1.5.2 2017/05/25 1.5.1で オートセーブ無効時にイベントメニューからセーブすると空でセーブされてしまう問題を修正
// 1.5.1 2017/04/03 オートセーブ無効時でも一部の条件でオートセーブされていた問題を修正
// 1.5.0 2016/12/05 高速でメッセージを送った場合に顔グラフィックを表示しようとするとエラーになる場合がある不具合を修正
//                  ノベル表示中に選択肢ウィンドウと数値入力ウィンドウの表示位置を調整できる機能を追加
// 1.4.0 2016/11/11 オートセーブ有効時、一定の手順を踏むとセーブデータをロードできなくなる不具合を修正
//                  選択肢表示後、直後にメッセージ表示がない場合でもウィンドウを閉じないよう修正
// 1.3.0 2016/09/28 ウィンドウ枠を自由に調整できる機能を追加
//                  ウィンドウの枠外をクリックしたときに文章を進めない設定を追加
//                  フォント名を指定できる機能を追加（デバイスにインストールされているフォントを使用します）
//                  明朝体、ゴシック体をどちらも使わない場合にフォントが小さく表示されてしまう問題を修正
//                  Edgeでフォントが小さく表示されてしまう問題を修正
// 1.2.0 2016/09/22 セーブファイルをひとつしか作成できない制約を解消
//                  オートセーブを単独で動作するよう修正
//                  イベント中にセーブやロードができるポーズメニューを追加
//                  クイックセーブ＆ロード機能を追加
//                  セーブファイルに表示できるチャプター表示機能を追加
// 1.1.0 2016/09/20 画面サイズ変更およびモバイル用の画面サイズ設定を追加
// 1.0.0 2016/08/16 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 視覺小說集合插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param InitialViewType
 * @text 顯示類型
 * @desc 訊息顯示的類型預設值。(0:正常 1:小說)
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Novel
 * @value 1
 *
 * @param TitleViewType
 * @text 標題窗口模式
 * @desc 標題畫面的命令窗口顯示模式。(0:正常 1:小說)
 * @default 1
 * @type select
 * @option Normal
 * @value 0
 * @option Novel
 * @value 1
 *
 * @param WaitByCommand
 * @text 顯示停頓圖示
 * @desc 事件命令中「顯示文字」等待每個訊息後面的停頓圖示。(ON/OFF)
 * @default true
 * @type boolean
 *
 * @param VariableSpeed
 * @text 顯示速度變數
 * @desc 儲存訊息顯示數度的變數ID。變數內的值為顯示 1 文字的待機時間。
 * @default 1
 * @type variable
 *
 * @param InitialSpeed
 * @text 顯示速度
 * @desc 顯示訊息速度的預設值。
 * @default 1
 * @type number
 *
 * @param RapidShowClick
 * @text 點擊瞬間顯示
 * @desc 在訊息中按下確定鍵或左鍵點擊瞬間顯示全部訊息。(ON/OFF)
 * @default true
 * @type boolean
 *
 * @param ClickInFrame
 * @text 是否限制點擊框內
 * @desc 當滑鼠點擊操作在訊息窗口的範圍內時才有效。(ON/OFF)
 * @default false
 * @type boolean
 *
 * @param AutoWordWrap
 * @text 自動換行
 * @desc 當訊息超過窗口時自動換行。(ON/OFF)
 * @default true
 * @type boolean
 *
 * @param RelativeFontSize
 * @text 小說窗口字體大小
 * @desc 小說窗口的字體大小。它是默認字體大小的相對值。
 * @default 6
 * @type number
 * @min -32
 * @max 32
 *
 * @param ViewMincho
 * @text 是否優先使用明朝字體
 * @desc 如果設備上安裝了明朝類型字體，則會優先使用它。(ON/OFF)
 * @default true
 * @type boolean
 *
 * @param ViewGothic
 * @text 是否優先使用哥特字體
 * @desc 如果設備上安裝了哥特式字體，則會優先使用。(ON/OFF)
 * @default false
 * @type boolean
 *
 * @param ViewCustomFont
 * @text 是否優先使用指定字體
 * @desc 如果設備上安裝了指定的字體，則會優先使用該字體。(複數指定使用逗號[,]區分)
 * @default
 *
 * @param SelectionPrefix
 * @text 選項順序前綴
 * @desc 選擇選項的順序前綴。(0:不使用 1:字母 2:數字)
 * @default 0
 * @type select
 * @option No Use
 * @value 0
 * @option Alphabet
 * @value 1
 * @option Number
 * @value 2
 *
 * @param ScreenWidth
 * @text 畫面寬度
 * @desc 水平方向的畫面尺寸。指定為 0 則不變更。
 * @default 0
 * @type number
 *
 * @param ScreenHeight
 * @text 畫面高度
 * @desc 垂直方向的畫面尺寸。指定為 0 則不變更。
 * @default 0
 * @type number
 *
 * @param ScreenWidthMobile
 * @text 手機畫面寬度
 * @desc 使用手機等時，水平方向的畫面尺寸。指定為 0 則不變更。
 * @default 0
 * @type number
 *
 * @param ScreenHeightMobile
 * @text 手機畫面高度
 * @desc 使用手機等時，垂直方向的畫面尺寸。指定為 0 則不變更。
 * @default 0
 * @type number
 *
 * @param MobileMode
 * @text 手機模式
 * @desc 可以在PC上以手機模式運行。它是一個主要用於測試的選項，但存在聲音不響的限制。
 * @default false
 * @type boolean
 *
 * @param AutoSave
 * @text 自動存檔
 * @desc 遊戲進度狀態將自動保存。當使用聲音小說作為迷你游戲時，建議為OFF。
 * @default true
 * @type boolean
 *
 * @param CanPause
 * @text 呼叫暫停選單
 * @desc 顯示類型為小說模式時，事件執行中使用取消按鍵將呼出暫停選單，可以進行存檔或讀取。
 * @default true
 * @type boolean
 *
 * @param NameAutoSave
 * @text 自動存檔名稱
 * @desc 存檔畫面自動存檔的名稱。
 * @default 自動存檔
 *
 * @param CommandLoad
 * @text 讀取文本
 * @desc 選單中的「讀取」的命令名稱。
 * @default 讀取
 *
 * @param CommandQuickSave
 * @text 快速存檔文本
 * @desc 選單中的「快速存檔」的命令名稱。
 * @default 快速存檔
 *
 * @param CommandQuickLoad
 * @text 快速讀取文本
 * @desc 選單中的「快速讀取」的命令名稱。
 * @default 快速讀取
 *
 * @param VerticalWriting
 * @text 直行顯示
 * @desc 小說顯示文字為直行顯示。(ON/OFF)
 * @default false
 * @type boolean
 *
 * @help 它是一個基礎插件，使用 RPGMakerMV 輕鬆創建視覺小說。
 * 使用時，訊息窗口的顯示變為整個畫面，
 * 並且顯示的消息將被留存在畫面上而不被刪除。
 *
 * 在顯示小說模式時按下取消按鈕或右鍵單擊（多點觸控）時，
 * 事件進度停止，並顯示暫停選單。
 * 暫停選單可以執行以下操作
 *
 * Save
 * Load
 * Quick Save
 * Quick Load
 * To Title
 * Cancel
 *
 * 控制字元
 * \UL    # 等待顯示文字立即取消等待並將事件命令前進到下一個。
 * \WC    # 關閉窗口，它將在此執行自動存檔。
 * \MS[n] # 暫時將文字顯示速度更改為「n」幀。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * NM_CHANGE_TYPE 1    # 更改文字的顯示類型。
 *                       移動地點後將反應設置。
 * NM_RE_WAIT          # 啟用控制字元[\UL]已解除的顯示文字等待。
 * NM_CLOSE            # 明確關閉窗口。
 * NM_SETTING_FIXED    # 將窗口的顯示設置固定為當前設置。
 *                       在固定狀態下，忽略後續文字的顯示設置。
 * NM_SETTING_RELEASE  # 恢復固定窗口的顯示設置。
 * NM_INPUT_NAME 1     # 顯示角色ID[1]的名稱輸入窗口(※)
 * ※這個命令在RPGアツマール無法使用。
 *
 * NM_SET_CHAPTER A    # 設置要輸出到存檔的章節標題。
 * NM_AUTO_SAVE        # 執行自動存檔。
 *
 * ・通過指定 X 座標， Y 座標，寬度和高度來調整小說窗口的顯示位置。
 * 　如果未指定參數，則顯示位置將返回到默認值。
 * NM_SET_RECT_NOVEL_WINDOW 0 0 600 300    # 設置窗口矩形。
 *
 * ・通過指定 X 座標和 Y 座標來調整小說窗口選項的中心坐標。
 * 　如果未指定參數，則顯示位置將返回到默認值。
 * NM_SET_RECT_NOVEL_COMMAND 0 0 # 設置小說選項的中心坐標。
 *
 * ・NM_CHANGE_TYPE
 * 變更訊息顯示的類型。類型如以下。
 *
 * 0 : 通常訊息顯示。
 * 1 : 顯示為小說模式。訊息將顯示在全畫面上，並且留存於畫面。
 *     自動調整顯示方式，包括選擇項和數字輸入。
 *
 * 請注意，在移動到該地點之前，不會反應設置更改。
 *
 * ・NM_SETTING_FIXED
 * 將窗口的設置固定為當前設置。設置目標如下。
 *
 * 1. 臉圖設定
 * 2. 類型(窗口、暗化、透明)
 * 3. 位置(上　中　下)
 *
 * 除非固定，否則文本顯示中的設置將被忽略。
 * 如果重新啟用，請執行 NM_SETTING_RELEASE 取消固定設置。
 *
 * ・NM_INPUT_NAME
 * 不使用專用畫面的簡易版輸入名稱的處理。
 * 如果為第二個參數設置了文字，則會在對話框中顯示說明。
 * 如果輸入值保留為空或取消，則不會更改名稱。
 * (例)
 * NM_INPUT_NAME 1 名前を入力してください。
 *
 * ・NM_SET_RECT_NOVEL_WINDOW
 * 指定整個畫面上顯示的小說窗口的顯示位置（X，Y，寬度，高度）。
 * 如果未指定參數，則返回默認大小。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';
    var pluginName    = 'NobleMushroom';
    var metaTagPrefix = 'NM_';
    var setting       = {
        unlockCode      : 'UL',
        windowCloseCode : 'WC',
        messageSpeedCode: 'MS',
    };

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
    };

    var getParamBoolean = function(paramNames) {
        var value = (getParamOther(paramNames) || '').toUpperCase();
        return value === 'ON' || value === 'TRUE';
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramInitialViewType    = getParamNumber(['InitialViewType', '表示タイプ初期値'], 0);
    var paramTitleViewType      = getParamNumber(['TitleViewType', 'タイトル表示タイプ'], 0);
    var paramVariableSpeed      = getParamNumber(['VariableSpeed', '表示速度変数'], 1, 5000);
    var paramRapidShowClick     = getParamBoolean(['RapidShowClick', 'クリック瞬間表示']);
    var paramClickInFrame       = getParamBoolean(['ClickInFrame', 'クリック範囲限定']);
    var paramInitialSpeed       = getParamNumber(['InitialSpeed', '表示速度初期値'], 0);
    var paramWaitByCommand      = getParamBoolean(['WaitByCommand', 'コマンド単位ウェイト']);
    var paramAutoWordWrap       = getParamBoolean(['AutoWordWrap', '自動改行']);
    var paramRelativeFontSize   = getParamNumber(['RelativeFontSize', '相対フォントサイズ'], -32, 32);
    var paramViewMincho         = getParamBoolean(['ViewMincho', '明朝体表示']);
    var paramViewGothic         = getParamBoolean(['ViewGothic', 'ゴシック体表示']);
    var paramViewCustomFont     = getParamString(['ViewCustomFont', '固有フォント表示']);
    var paramSelectionPrefix    = getParamNumber(['SelectionPrefix', '選択肢接頭辞'], 0, 2);
    var paramScreenWidth        = getParamNumber(['ScreenWidth', '画面横サイズ'], 0);
    var paramScreenHeight       = getParamNumber(['ScreenHeight', '画面縦サイズ'], 0);
    var paramScreenWidthMobile  = getParamNumber(['ScreenWidthMobile', 'モバイル画面横サイズ'], 0);
    var paramScreenHeightMobile = getParamNumber(['ScreenHeightMobileScreenHeightMobile', 'モバイル画面縦サイズ'], 0);
    var paramMobileMode         = getParamBoolean(['MobileMode', 'モバイルモード']);
    var paramAutoSave           = getParamBoolean(['AutoSave', 'オートセーブ']);
    var paramCanPause           = getParamBoolean(['CanPause', 'ポーズ可能']);
    var paramNameAutoSave       = getParamString(['NameAutoSave', 'オートセーブ名称']);
    var paramCommandLoad        = getParamString(['CommandLoad', 'ロードコマンド']);
    var paramCommandQuickLoad   = getParamString(['CommandQuickLoad', 'Qロードコマンド']);
    var paramCommandQuickSave   = getParamString(['CommandQuickSave', 'Qセーブコマンド']);
    var paramVerticalWriting    = getParamBoolean(['VerticalWriting', '縦書き']);

    //=============================================================================
    // インタフェースの定義
    //=============================================================================
    var _InterfaceWindow_Message      = Window_Message;
    var _InterfaceWindow_TitleCommand = Window_TitleCommand;
    var _InterfaceWindow_ChoiceList   = Window_ChoiceList;
    var _InterfaceWindow_NumberInput  = Window_NumberInput;

    //=============================================================================
    // Utils
    //  文字列の挿入処理
    //=============================================================================
    Utils.spliceString = function(originalString, index, howMany, addString) {
        if (howMany < 0) howMany = 0;
        return (originalString.slice(0, index) + addString + originalString.slice(index + howMany));
    };

    var _Utils_isMobileDevice = Utils.isMobileDevice;
    Utils.isMobileDevice      = function() {
        return paramMobileMode || _Utils_isMobileDevice.apply(this, arguments);
    };

    Utils.isMsEdge = function() {
        var r = /edge/i;
        return !!navigator.userAgent.match(r);
    };

    //=============================================================================
    // TouchInput
    //  ホイール回転時に座標を記録
    //=============================================================================
    var _TouchInput__onWheel = TouchInput._onWheel;
    TouchInput._onWheel      = function(event) {
        _TouchInput__onWheel.apply(this, arguments);
        this._x = Graphics.pageToCanvasX(event.pageX);
        this._y = Graphics.pageToCanvasY(event.pageY);
    };

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (!command.match(new RegExp('^' + metaTagPrefix))) return;
        this.pluginCommandBlueMushroom(command.replace(metaTagPrefix, ''), args);
    };

    Game_Interpreter.prototype.pluginCommandBlueMushroom = function(command, args) {
        switch (getCommandName(command)) {
            case '再ウェイト' :
            case 'RE_WAIT' :
                if ($gameMessage.isBusy()) this.setWaitMode('message');
                break;
            case 'タイプ変更' :
            case 'CHANGE_TYPE' :
                $gameSystem.changeMessageType(getArgNumber(args[0], 0));
                break;
            case '閉じる' :
            case 'CLOSE' :
                $gameMessage.setCloseForce(true);
                break;
            case '設定固定' :
            case 'SETTING_FIXED' :
                $gameSystem.setMessageSettingFixed(true);
                break;
            case '設定固定解除' :
            case 'SETTING_RELEASE' :
                $gameSystem.setMessageSettingFixed(false);
                break;
            case '名前入力' :
            case 'INPUT_NAME' :
                $gameMessage.popupNameInputPrompt(getArgNumber(args[0], 1), getArgString(args[1]));
                break;
            case 'チャプター設定' :
            case 'SET_CHAPTER' :
                $gameSystem.setChapterTitle(getArgString(args[0]));
                $gameSystem.executeAutoSave();
                break;
            case 'オートセーブ' :
            case 'AUTO_SAVE' :
                $gameSystem.executeAutoSave();
                break;
            case 'ノベルウィンドウ位置設定' :
            case 'SET_RECT_NOVEL_WINDOW' :
                var rect = [];
                if (args.length > 0) {
                    rect[0] = getArgNumber(args[0], 0);
                    rect[1] = getArgNumber(args[1], 0);
                    rect[2] = getArgNumber(args[2], 1);
                    rect[3] = getArgNumber(args[3], 1);
                }
                $gameSystem.setNovelWindowRectangle.apply($gameSystem, rect);
                break;
            case 'ノベルコマンド位置設定':
            case 'SET_RECT_NOVEL_COMMAND':
                var position = [];
                if (args.length > 0) {
                    position[0] = getArgNumber(args[0], 0);
                    position[1] = getArgNumber(args[1], 0);
                }
                $gameSystem.setNovelCommandPosition.apply($gameSystem, position);
                break;
        }
    };

    var _Game_Interpreter_command101      = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function() {
        if (!$gameMessage.isBusy()) {
            $gameMessage.setInterpreter(this);
        }
        _Game_Interpreter_command101.apply(this, arguments);
    };

    var _Game_Interpreter_update      = Game_Interpreter.prototype.update;
    Game_Interpreter.prototype.update = function() {
        if ($gameMessage.isPause()) return;
        _Game_Interpreter_update.apply(this, arguments);
    };

    //=============================================================================
    // Game_System
    //  全画面ウィンドウの有効フラグを管理します。
    //=============================================================================
    var _Game_System_initialize      = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.apply(this, arguments);
        this._messageViewType      = paramInitialViewType;
        this._messageSetting       = null;
        this._chapterTitle         = '';
        this._novelWindowRectangle = null;
        this._novelCommandPosition = null;
    };

    Game_System.prototype.getNovelWindowRectangle = function() {
        return this._novelWindowRectangle;
    };

    Game_System.prototype.setNovelWindowRectangle = function(x, y, width, height) {
        if (arguments.length === 0) {
            this._novelWindowRectangle = null;
        } else {
            this._novelWindowRectangle = new Rectangle(x, y, width, height);
        }
    };

    Game_System.prototype.getNovelCommandPosition = function() {
        return this._novelCommandPosition;
    };

    Game_System.prototype.setNovelCommandPosition = function(x, y) {
        if (arguments.length === 0) {
            this._novelCommandPosition = null;
        } else {
            this._novelCommandPosition = new Point(x, y);
        }
    };

    Game_System.prototype.getMessageType = function() {
        return this._messageViewType;
    };

    Game_System.prototype.changeMessageType = function(value) {
        this._messageViewType = value.clamp(0, 1);
    };

    Game_System.prototype.setMessageSettingFixed = function(value) {
        this._messageSetting = !!value;
    };

    Game_System.prototype.isMessageSettingFixed = function() {
        return this._messageSetting;
    };

    Game_System.prototype.setFaceImage = function(faceName, faceIndex) {
        if (!this.isMessageSettingFixed()) {
            this._faceName  = faceName;
            this._faceIndex = faceIndex;
        }
    };

    Game_System.prototype.setBackground = function(background) {
        if (!this.isMessageSettingFixed()) {
            this._background = background;
        }
    };

    Game_System.prototype.setPositionType = function(positionType) {
        if (!this.isMessageSettingFixed()) {
            this._positionType = positionType;
        }
    };

    Game_System.prototype.executeAutoSave = function() {
        this.onBeforeSave();
        DataManager.saveGameAuto();
    };

    Game_System.prototype.getChapterTitle = function() {
        return this._chapterTitle || '';
    };

    Game_System.prototype.setChapterTitle = function(value) {
        this._chapterTitle = value;
    };

    //=============================================================================
    // Game_Message
    //  ウェイト解除処理を追加定義します。
    //=============================================================================
    var _Game_Message_clear      = Game_Message.prototype.clear;
    Game_Message.prototype.clear = function() {
        _Game_Message_clear.apply(this, arguments);
        this._interpreter = null;
        this._closeForce  = false;
    };

    Game_Message.prototype.setPause = function(value) {
        this._pauseing = !!value;
    };

    Game_Message.prototype.isPause = function() {
        return !!this._pauseing;
    };

    Game_Message.prototype.setInterpreter = function(interpreter) {
        this._interpreter = interpreter;
    };

    Game_Message.prototype.setWaitMode = function(value) {
        if (this._interpreter) {
            this._interpreter.setWaitMode(value);
        }
    };

    Game_Message.prototype.setNoWait = function() {
        if (this._texts.length > 0) {
            this._texts[this._texts.length - 1] += '\\^';
        }
    };

    Game_Message.prototype.setCloseForce = function(value) {
        this._closeForce = !!value;
    };

    Game_Message.prototype.isCloseForce = function() {
        return this._closeForce;
    };

    var _Game_Message_setFaceImage      = Game_Message.prototype.setFaceImage;
    Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
        _Game_Message_setFaceImage.apply(this, arguments);
        $gameSystem.setFaceImage(faceName, faceIndex);
    };

    var _Game_Message_setBackground      = Game_Message.prototype.setBackground;
    Game_Message.prototype.setBackground = function(background) {
        _Game_Message_setBackground.apply(this, arguments);
        $gameSystem.setBackground(background);
    };

    var _Game_Message_setPositionType      = Game_Message.prototype.setPositionType;
    Game_Message.prototype.setPositionType = function(positionType) {
        _Game_Message_setPositionType.apply(this, arguments);
        $gameSystem.setPositionType(positionType);
    };

    var _Game_Message_faceName      = Game_Message.prototype.faceName;
    Game_Message.prototype.faceName = function() {
        return _Game_Message_faceName.apply($gameSystem.isMessageSettingFixed() ? $gameSystem : this, arguments);
    };

    var _Game_Message_faceIndex      = Game_Message.prototype.faceIndex;
    Game_Message.prototype.faceIndex = function() {
        return _Game_Message_faceIndex.apply($gameSystem.isMessageSettingFixed() ? $gameSystem : this, arguments);
    };

    var _Game_Message_background      = Game_Message.prototype.background;
    Game_Message.prototype.background = function() {
        return _Game_Message_background.apply($gameSystem.isMessageSettingFixed() ? $gameSystem : this, arguments);
    };

    var _Game_Message_positionType      = Game_Message.prototype.positionType;
    Game_Message.prototype.positionType = function() {
        return _Game_Message_positionType.apply($gameSystem.isMessageSettingFixed() ? $gameSystem : this, arguments);
    };

    Game_Message.prototype.popupNameInputPrompt = function(actorId, message) {
        var actor        = $gameActors.actor(actorId);
        var defaultValue = actor ? actor.name() : '';
        var result       = window.prompt(message || '', defaultValue);
        if (Utils.isNwjs()) {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            win.focus();
            Input.clear();
        }
        if (result) actor.setName(result);
    };

    //=============================================================================
    // SceneManager
    //  画面サイズを再設定します。
    //=============================================================================
    var _SceneManager_initialize = SceneManager.initialize;
    SceneManager.initialize      = function() {
        _SceneManager_initialize.apply(this, arguments);
        StorageManager.makeSaveDirectly();
    };

    var _SceneManager_initGraphics = SceneManager.initGraphics;
    SceneManager.initGraphics      = function() {
        this.setScreenSize();
        _SceneManager_initGraphics.apply(this, arguments);
    };

    SceneManager.setScreenSize = function() {
        var width, height;
        if (Utils.isMobileDevice()) {
            width  = paramScreenWidthMobile || paramScreenWidth;
            height = paramScreenHeightMobile || paramScreenHeight;
        } else {
            width  = paramScreenWidth;
            height = paramScreenHeight;
        }
        this._screenWidth  = width || this._screenWidth;
        this._screenHeight = height || this._screenHeight;
        this._boxWidth     = width || this._boxWidth;
        this._boxHeight    = height || this._boxHeight;
        if (width || height) {
            var dw = this._screenWidth - window.innerWidth;
            var dh = this._screenHeight - window.innerHeight;
            window.moveBy(-dw / 2, -dh / 2);
            window.resizeBy(dw, dh);
        }
    };

    //=============================================================================
    // DataManager
    //  オートセーブを追加定義します。
    //=============================================================================
    Object.defineProperty(DataManager, '_lastAccessedId', {
        get: function() {
            return this.__lastAccessedId;
        },
        set: function(value) {
            if (value !== this.getAutoSaveId()) {
                this.__lastAccessedId = value;
            }
        }
    });

    DataManager._isShiftAutoSave = false;

    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects      = function() {
        _DataManager_createGameObjects.apply(this, arguments);
        $gameVariables.setValue(paramVariableSpeed, paramInitialSpeed);
    };

    var _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
    DataManager.makeSavefileInfo      = function() {
        var info     = _DataManager_makeSavefileInfo.apply(this, arguments);
        info.chapter = $gameSystem.getChapterTitle();
        return info;
    };

    DataManager.getAutoSaveId = function() {
        return this.maxSavefiles() + 1;
    };

    DataManager.shiftAutoSave = function(saveFileId) {
        this._isShiftAutoSave = true;
        var result            = this.saveGame(saveFileId);
        this._isShiftAutoSave = false;
        return result;
    };

    DataManager.saveGameAuto = function() {
        this._processAutoSave = true;
        if (paramAutoSave) {
            this.saveGameWithoutRescue(this.getAutoSaveId());
        } else {
            var json = JsonEx.stringify(this.makeSaveContents());
            if (json.length >= 200000) {
                console.warn('Save data too big!');
            }
            StorageManager.save(this.getAutoSaveId(), json);
        }
        this._processAutoSave = false;
    };

    var _DataManager_latestSavefileId = DataManager.latestSavefileId;
    DataManager.latestSavefileId      = function() {
        var id = _DataManager_latestSavefileId.apply(this, arguments);
        return this.convertToGlobalFileId(id);
    };

    var _DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame      = function(savefileId) {
        arguments[0] = this.convertToAutoSaveId(savefileId);
        return _DataManager_loadGame.apply(this, arguments);
    };

    DataManager.loadGameReserve = function() {
        return this.loadGame(this._resvereLoadFileId);
    };

    DataManager.reserveLoad = function(savefileId) {
        savefileId = this.convertToAutoSaveId(savefileId);
        var result = this.isThisGameFile(savefileId);
        if (result) {
            this._resvereLoadFileId = savefileId;
        }
        return result;
    };

    DataManager.convertToAutoSaveId = function(savefileId) {
        return savefileId === 0 ? this.getAutoSaveId() : savefileId;
    };

    DataManager.convertToGlobalFileId = function(savefileId) {
        return savefileId === this.getAutoSaveId() ? 0 : savefileId;
    };

    DataManager.isShiftAutoSave = function() {
        return this._isShiftAutoSave;
    };

    DataManager.isProcessAutoSave = function() {
        return this._processAutoSave;
    };

    //=============================================================================
    // StorageManager
    //  オートセーブ時にjson文字列を保持します。
    //=============================================================================
    StorageManager._autoSaveJson = null;

    var _StorageManager_save = StorageManager.save;
    StorageManager.save      = function(savefileId, json) {
        if (this.isAutoSave(savefileId)) {
            this._autoSaveJson = json;
            if (!paramAutoSave) return;
        }
        if (DataManager.isShiftAutoSave() && savefileId > 0) {
            arguments[1] = this._autoSaveJson;
        }
        _StorageManager_save.apply(this, arguments);
    };

    var _StorageManager_saveToLocalFile = StorageManager.saveToLocalFile;
    StorageManager.saveToLocalFile      = function(savefileId, json) {
        if (DataManager.isProcessAutoSave() && this.isAutoSave(savefileId)) {
            var data     = LZString.compressToBase64(json);
            var fs       = require('fs');
            var filePath = this.localFilePath(savefileId);
            fs.writeFile(filePath, data, null, function(err) {
                if (!err) return;
                console.log(err.stack);
                this.makeSaveDirectly();
            }.bind(this));
        } else {
            _StorageManager_saveToLocalFile.apply(this, arguments);
        }
    };

    StorageManager.isAutoSave = function(savefileId) {
        return savefileId === DataManager.getAutoSaveId();
    };

    StorageManager.isGlobalSave = function(savefileId) {
        return savefileId === 0;
    };

    StorageManager.makeSaveDirectly = function() {
        if (this.isLocalMode()) {
            var fs      = require('fs');
            var dirPath = this.localFileDirectoryPath();
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
        }
    };

    //=============================================================================
    // Scene_AutoLoad
    //  オートロード画面を追加定義します。
    //=============================================================================
    function Scene_AutoLoad() {
        this.initialize.apply(this, arguments);
    }

    Scene_AutoLoad.prototype             = Object.create(Scene_Load.prototype);
    Scene_AutoLoad.prototype.constructor = Scene_AutoLoad;

    Scene_AutoLoad.prototype.create = function() {
    };

    Scene_AutoLoad.prototype.start = function() {
        this.executeAutoLoad();
    };

    Scene_AutoLoad.prototype.onLoadSuccess = function() {
        this.reloadMapIfUpdated();
        SceneManager.goto(Scene_Map);
        $gameSystem.onAfterLoad();
    };

    Scene_AutoLoad.prototype.executeAutoLoad = function() {
        if (DataManager.loadGameReserve()) {
            this.onLoadSuccess();
        } else {
            SoundManager.playBuzzer();
            SceneManager.goto(Scene_Map);
        }
    };

    //=============================================================================
    // Scene_Title
    //  フラグによってコマンドウィンドウのクラスを変更します。
    //=============================================================================
    var _Scene_Title_createCommandWindow      = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        this.changeImplementationWindowCommand(paramTitleViewType);
        _Scene_Title_createCommandWindow.apply(this, arguments);
        this.restoreImplementationWindowCommand();
    };

    Scene_Title.prototype.changeImplementationWindowCommand = function(type) {
        var classWindow_TitleCommand;
        switch (type) {
            case 1 :
                classWindow_TitleCommand = Window_NovelTitleCommand;
                break;
            default :
                classWindow_TitleCommand = _InterfaceWindow_TitleCommand;
        }
        Window_TitleCommand = classWindow_TitleCommand;
    };

    Scene_Title.prototype.restoreImplementationWindowCommand = function() {
        Window_TitleCommand = _InterfaceWindow_TitleCommand;
    };

    //=============================================================================
    // Scene_Load
    //  オートセーブ有効時にオートセーブ用のインデックスを有効にします。
    //=============================================================================
    Scene_Load.prototype.savefileId = function() {
        return Scene_File.prototype.savefileId.apply(this, arguments) - (paramAutoSave ? 1 : 0);
    };

    var _Scene_Load_firstSavefileIndex      = Scene_Load.prototype.firstSavefileIndex;
    Scene_Load.prototype.firstSavefileIndex = function() {
        return _Scene_Load_firstSavefileIndex.apply(this, arguments) + (paramAutoSave ? 1 : 0);
    };

    //=============================================================================
    // Scene_Map
    //  フラグによってメッセージウィンドウのクラスを変更します。
    //=============================================================================
    Scene_Map.symbolSave = 'save';
    Scene_Map.symbolLoad = 'load';

    var _Scene_Map_createDisplayObjects      = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.apply(this, arguments);
        if ($gameSystem.getMessageType() && paramCanPause) {
            this.createPauseWindow();
        }
    };

    Scene_Map.prototype.createPauseWindow = function() {
        this._pauseWindow = new Window_PauseMenu();
        this._pauseWindow.setHandler(Scene_Map.symbolSave, this.callSave.bind(this));
        this._pauseWindow.setHandler(Scene_Map.symbolLoad, this.callLoad.bind(this));
        this._pauseWindow.setHandler('quickSave', this.callQuickSave.bind(this));
        this._pauseWindow.setHandler('quickLoad', this.callQuickLoad.bind(this));
        this._pauseWindow.setHandler('toTitle', this.callToTitle.bind(this));
        this._pauseWindow.setHandler('cancel', this.offPause.bind(this));
        this.addWindow(this._pauseWindow);
    };

    Scene_Map.prototype.createListWindow = function() {
        var x                = 0;
        var y                = 0;
        var width            = Graphics.boxWidth;
        var height           = Graphics.boxHeight - y;
        this._fileListWindow = new Window_SavefileList(x, y, width, height);
        this.addWindow(this._fileListWindow);
        this._fileListWindow.openness = 0;
        this._fileListWindow.hide();
    };

    Scene_Map.prototype.callSave = function() {
        this._fileMode = Scene_Map.symbolSave;
        this.setupFileListWindow();
    };

    Scene_Map.prototype.callLoad = function() {
        this._fileMode = Scene_Map.symbolLoad;
        this.setupFileListWindow();
    };

    Scene_Map.prototype.callQuickSave = function() {
        this.processSave(DataManager.lastAccessedSavefileId());
        this._pauseWindow.activate();
    };

    Scene_Map.prototype.callQuickLoad = function() {
        this.processLoad(DataManager.latestSavefileId());
    };

    Scene_Map.prototype.callToTitle = function() {
        SceneManager.goto(Scene_Title);
    };

    Scene_Map.prototype.isFileModeSave = function() {
        return this._fileMode === Scene_Map.symbolSave;
    };

    Scene_Map.prototype.setupFileListWindow = function() {
        if (!this._fileListWindow) {
            this.createListWindow();
        }
        this._fileListWindow.setHandler('ok', this.onFileListWindowOk.bind(this));
        this._fileListWindow.setHandler('cancel', this.onFileListWindowCancel.bind(this));
        this._fileListWindow.setupForMapSave(this.firstSavefileIndex(), this._fileMode);
        this._pauseWindow.deactivate();
    };

    Scene_Map.prototype.firstSavefileIndex = function() {
        if (this.isFileModeSave()) {
            return Scene_Save.prototype.firstSavefileIndex.apply(this, arguments);
        } else {
            return Scene_Load.prototype.firstSavefileIndex.apply(this, arguments);
        }
    };

    Scene_Map.prototype.onFileListWindowOk = function() {
        if (this.isFileModeSave()) {
            this.processSave(this.savefileId());
            this._pauseWindow.activate();
        } else {
            this.processLoad(this.savefileId());
        }
        this.closeListWindow();
    };

    Scene_Map.prototype.onFileListWindowCancel = function() {
        this.closeListWindow();
        this._pauseWindow.activate();
    };

    Scene_Map.prototype.processSave = function(saveFileId) {
        if (DataManager.shiftAutoSave(saveFileId)) {
            SoundManager.playSave();
            StorageManager.cleanBackup(saveFileId);
        } else {
            SoundManager.playBuzzer();
        }
    };

    Scene_Map.prototype.processLoad = function(saveFileId) {
        if (DataManager.reserveLoad(saveFileId)) {
            SoundManager.playLoad();
            this.fadeOutAll();
            SceneManager.goto(Scene_AutoLoad);
            $gameMessage.setPause(true);
        } else {
            SoundManager.playBuzzer();
        }
    };

    Scene_Map.prototype.savefileId = function() {
        return this._fileListWindow.getSaveFileId();
    };

    Scene_Map.prototype.closeListWindow = function() {
        this._fileListWindow.close();
        this._fileListWindow.deactivate();
    };

    var _Scene_Map_createMessageWindow      = Scene_Map.prototype.createMessageWindow;
    Scene_Map.prototype.createMessageWindow = function() {
        this.changeImplementationWindowMessage($gameSystem.getMessageType());
        _Scene_Map_createMessageWindow.apply(this, arguments);
        this.restoreImplementationWindowMessage();
        this._messageWindow.setPauseHandler(this.onPause.bind(this), null);
    };

    Scene_Map.prototype.changeImplementationWindowMessage = function(type) {
        var classWindow_Message, classWindow_ChoiceList, classWindow_NumberInput;
        switch (type) {
            case 1 :
                classWindow_Message     = Window_NovelMessage;
                classWindow_ChoiceList  = Window_NovelChoiceList;
                classWindow_NumberInput = Window_NovelNumberInput;
                break;
            default :
                classWindow_Message     = _InterfaceWindow_Message;
                classWindow_ChoiceList  = _InterfaceWindow_ChoiceList;
                classWindow_NumberInput = _InterfaceWindow_NumberInput;
        }
        Window_Message     = classWindow_Message;
        Window_ChoiceList  = classWindow_ChoiceList;
        Window_NumberInput = classWindow_NumberInput;
    };

    Scene_Map.prototype.restoreImplementationWindowMessage = function() {
        Window_Message     = _InterfaceWindow_Message;
        Window_ChoiceList  = _InterfaceWindow_ChoiceList;
        Window_NumberInput = _InterfaceWindow_NumberInput;
    };

    var _Scene_Map_start      = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.apply(this, arguments);
        $gameSystem.executeAutoSave();
    };

    Scene_Map.prototype.onPause = function() {
        Input.clear();
        $gameMessage.setPause(true);
        this._pauseWindow.show();
        this._pauseWindow.open();
        this._pauseWindow.activate();
        this._messageWindow.keepActivationSubWindow();
    };

    Scene_Map.prototype.offPause = function() {
        Input.clear();
        $gameMessage.setPause(false);
        this._pauseWindow.close();
        this._pauseWindow.deactivate();
        this._messageWindow.restoreActivationSubWindow();
    };

    //=============================================================================
    // Window_SavefileList
    //  セーブファイルリスト画面
    //=============================================================================
    Window_SavefileList.prototype.isModeLoad = function() {
        return this._mode === 'load';
    };

    Window_SavefileList.prototype.isNeedAutoSave = function() {
        return this.isModeLoad() && paramAutoSave;
    };

    Window_SavefileList.prototype.setupForMapSave = function(index, mode) {
        this.setMode(mode);
        this.select(index);
        this.setTopRow(index - 2);
        this.changePaintOpacity(true);
        this.backOpacity = 240;
        this.refresh();
        this.show();
        this.open();
        this.activate();
    };

    var _Window_SavefileList_maxItems      = Window_SavefileList.prototype.maxItems;
    Window_SavefileList.prototype.maxItems = function() {
        return _Window_SavefileList_maxItems.apply(this, arguments) + (this.isNeedAutoSave() ? 1 : 0);
    };

    var _Window_SavefileList_drawItem      = Window_SavefileList.prototype.drawItem;
    Window_SavefileList.prototype.drawItem = function(index) {
        if (index > 0 || !this.isNeedAutoSave()) {
            if (this.isNeedAutoSave()) arguments[0]--;
            _Window_SavefileList_drawItem.apply(this, arguments);
        } else {
            var rect       = this.itemRectForText(-1);
            var autoSaveId = DataManager.getAutoSaveId();
            var valid      = DataManager.isThisGameFile(autoSaveId);
            var info       = DataManager.loadSavefileInfo(autoSaveId);
            this.resetTextColor();
            if (this._mode === 'load') {
                this.changePaintOpacity(valid);
            }
            this.drawText(paramNameAutoSave, rect.x, rect.y, 180);
            if (info) {
                this.changePaintOpacity(valid);
                this.drawContents(info, rect, valid);
                this.changePaintOpacity(true);
            }
        }
    };

    Window_SavefileList.prototype.itemRectForText = function(index) {
        return Window_Selectable.prototype.itemRectForText.call(this, index + (this.isNeedAutoSave() ? 1 : 0));
    };

    Window_SavefileList.prototype.getSaveFileId = function() {
        return this.index() + 1 - (this.isNeedAutoSave() ? 1 : 0);
    };

    var _Window_SavefileList_drawGameTitle      = Window_SavefileList.prototype.drawGameTitle;
    Window_SavefileList.prototype.drawGameTitle = function(info, x, y, width) {
        _Window_SavefileList_drawGameTitle.apply(this, arguments);
        if (info.chapter) {
            this.drawText(info.chapter, x, y, width, 'right');
        }
    };

    //=============================================================================
    // Window_Message
    //  メッセージの表示速度などを調整します。
    //=============================================================================
    var _Window_Message_updateWait      = Window_Message.prototype.updateWait;
    Window_Message.prototype.updateWait = function() {
        if (paramRapidShowClick && this._textState && this.isTriggered()) {
            this._showAll = true;
        }
        return _Window_Message_updateWait.apply(this, arguments);
    };

    var _Window_Message_updateMessage      = Window_Message.prototype.updateMessage;
    Window_Message.prototype.updateMessage = function() {
        var speed = this.getMessageSpeed();
        if (this._textState && !this._lineShowFast) {
            if (speed <= 0 || this._showAll) {
                this._showFast = true;
            } else {
                this._waitCount = speed - 1;
            }
        }
        return _Window_Message_updateMessage.apply(this, arguments);
    };

    Window_Message.prototype.getMessageSpeed = function() {
        return this._tempMessageSpeed !== null ? this._tempMessageSpeed : $gameVariables.value(paramVariableSpeed);
    };

    Window_Message.prototype.setTempMessageSpeed = function(speed) {
        if (speed >= 0) {
            this._tempMessageSpeed = speed;
            if (speed > 0) this._showFast = false;
        } else {
            this._tempMessageSpeed = null;
        }
    };

    var _Window_Message_clearFlags      = Window_Message.prototype.clearFlags;
    Window_Message.prototype.clearFlags = function() {
        _Window_Message_clearFlags.apply(this, arguments);
        this._windowClosing    = false;
        this._showAll          = false;
        this._tempMessageSpeed = null;
    };

    var _Window_Message_processEscapeCharacter      = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        if (code === '>') this._waitCount = 0;
        switch (code) {
            case setting.unlockCode:
                $gameMessage.setWaitMode('');
                break;
            case setting.windowCloseCode:
                if (this.isNovelWindow()) this.setWindowClosing();
                break;
            case setting.messageSpeedCode:
                this.setTempMessageSpeed(this.obtainEscapeParam(textState));
                break;
            default:
                _Window_Message_processEscapeCharacter.apply(this, arguments);
        }
    };

    Window_Message.prototype.isNovelWindow = function() {
        return false;
    };

    Window_Message.prototype.isNormalMessageWindow = function() {
        return true;
    };

    Window_Message.prototype.setPauseHandler = function(handler, args) {
        this._pauseHandler = [handler, args];
    };

    Window_Message.prototype.callPauseHandler = function() {
        var handler = this._pauseHandler;
        if (handler) {
            handler[0].apply(this, handler[1]);
        }
    };

    var _Window_Message_update      = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        if (paramCanPause && !this.isNormalMessageWindow() && !$gameMessage.isPause()) this.checkInputPause();
        if ($gameMessage.isPause()) return;
        _Window_Message_update.apply(this, arguments);
    };

    Window_Message.prototype.checkInputPause = function() {
        if (this.isTriggeredPause() && this.canCallPause()) {
            SoundManager.playOk();
            this.callPauseHandler();
        }
    };

    Window_Message.prototype.isTriggeredPause = function() {
        return Input.isTriggered('escape') || (TouchInput.isCancelled() && this.isTouchedInsideFrame());
    };

    Window_Message.prototype.canCallPause = function() {
        return $gameMap.isEventRunning() && !$gamePlayer.isTransferring();
    };

    Window_Message.prototype.keepActivationSubWindow = function() {
        this._keepActivation = [];
        this.subWindows().forEach(function(subWindow) {
            this._keepActivation.push(subWindow.active);
            subWindow.deactivate();
        }.bind(this));
    };

    Window_Message.prototype.restoreActivationSubWindow = function() {
        this.subWindows().forEach(function(subWindow) {
            var active = this._keepActivation.shift();
            if (active) {
                subWindow.activate();
            } else {
                subWindow.deactivate();
            }
        }.bind(this));
    };

    var _Window_Message_isTriggered      = Window_Message.prototype.isTriggered;
    Window_Message.prototype.isTriggered = function() {
        var result = _Window_Message_isTriggered.apply(this, arguments);
        if (!Input.isRepeated('ok') && !Input.isRepeated('cancel')) {
            result = (result || TouchInput.wheelY >= 1) && this.isTouchedInsideFrame();
        }
        return result;
    };

    Window_Message.prototype.isTouchedInsideFrame = function() {
        return !paramClickInFrame || Window_Selectable.prototype.isTouchedInsideFrame.apply(this, arguments);
    };

    //=============================================================================
    // Window_NovelMessage
    //  ノベルメッセージ表示用のクラスです。
    //=============================================================================
    function Window_NovelMessage() {
        this.initialize.apply(this, arguments);
    }

    Window_NovelMessage.prototype             = Object.create(Window_Message.prototype);
    Window_NovelMessage.prototype.constructor = Window_Message;

    Window_NovelMessage.fontFaceMincho = '"ヒラギノ明朝 ProN W3","Hiragino Mincho ProN","ＭＳ Ｐ明朝","MS PMincho",';
    Window_NovelMessage.fontFaceGothic = '"ヒラギノゴシック ProN W3","Hiragino Gothic ProN","ＭＳ Ｐゴシック","MS PGothic",';

    Window_NovelMessage.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_NovelMessage.prototype.windowHeight = function() {
        return Graphics.boxHeight;
    };

    Window_NovelMessage.prototype.standardFontSize = function() {
        return Window_Base.prototype.standardFontSize.apply(this, arguments) + paramRelativeFontSize;
    };

    Window_NovelMessage.prototype.standardFontFace = function() {
        var fontFace = '';
        if (paramViewCustomFont) {
            fontFace += paramViewCustomFont;
            if (fontFace[fontFace.length - 1] !== ',') fontFace += ',';
        }
        if (paramViewMincho) fontFace += Window_NovelMessage.fontFaceMincho;
        if (paramViewGothic) fontFace += Window_NovelMessage.fontFaceGothic;
        fontFace += Window_Base.prototype.standardFontFace.call(this);
        return fontFace;
    };

    Window_NovelMessage.prototype.startInput = function() {
        var result = _InterfaceWindow_Message.prototype.startInput.apply(this, arguments);
        if (result) {
            if (!this.isOpen() || !this._textState) {
                this.contents.clear();
                this.open();
            }
        } else {
            this.startClose();
        }
        return result;
    };

    Window_NovelMessage.prototype.startClose = function() {
        if ($gameMessage.isCloseForce()) {
            $gameMessage.setCloseForce(false);
            this.closeForce();
        }
    };

    Window_NovelMessage.prototype.startMessage = function() {
        if (!paramWaitByCommand) {
            $gameMessage.setNoWait();
        }
        if (!this._prevTextState) {
            _InterfaceWindow_Message.prototype.startMessage.apply(this, arguments);
        } else {
            this._textState      = this._prevTextState;
            this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
            this._textState.top  = this._textState.y;
            this.processNewLine(this._textState);
            this._textState.index = 0;
            this.resetFontSettings();
            this.clearFlags();
            this.loadMessageFace();
            this.open();
            if (this.initializeMessageAutoCount) {
                this.initializeMessageAutoCount();
            }
        }
    };

    Window_NovelMessage.prototype.updatePlacement = function() {
        var rectangle  = $gameSystem.getNovelWindowRectangle();
        var prevWidth  = this.width;
        var prevHeight = this.height;
        if (rectangle) {
            this.move(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        } else {
            this.move(0, 0, this.windowWidth(), this.windowHeight());
        }
        if (prevWidth !== this.width || prevHeight !== this.height) {
            this.createContents();
        }
    };

    Window_NovelMessage.prototype.newPage = function(textState) {
        textState.top = 0;
        textState.y   = 0;
        _InterfaceWindow_Message.prototype.newPage.apply(this, arguments);
    };

    Window_NovelMessage.prototype.onEndOfText = function() {
        this.dumpMessage();
        $gameMessage.setFaceImage('', 0);
        _InterfaceWindow_Message.prototype.onEndOfText.apply(this, arguments);
    };

    Window_NovelMessage.prototype.dumpMessage = function() {
        this._prevTextState = (!this._windowClosing ? this._textState : null);
    };

    Window_NovelMessage.prototype.clearDumpMessage = function() {
        this._prevTextState = null;
    };

    Window_NovelMessage.prototype.startPause = function() {
        _InterfaceWindow_Message.prototype.startPause.apply(this, arguments);
        var position = this._signPositionNewLine ? this._signPositionNewLine : this.getPauseSignSpritePosition();
        this.setPauseSignSpritePosition(position);
    };

    Window_NovelMessage.prototype.setPauseSignSpritePosition = function(position) {
        var signSprite = this._windowPauseSignSprite;
        signSprite.x   = position.x;
        signSprite.y   = position.y;
        signSprite.setBlendColor(this._windowClosing || this._signPositionNewLine ? [255, 0, 0, 128] : [0, 0, 0, 0]);
    };

    Window_NovelMessage.prototype.getPauseSignSpritePosition = function() {
        var signSprite = this._windowPauseSignSprite;
        var x = 0, y = 0;
        if (paramVerticalWriting) {
            x = this.contents.width - this._textState.y - this.padding + (this.contents.fontSize / 2);
            y = this._textState.x + this.padding + signSprite.height;
        } else {
            x = this._textState.x + this.padding + (signSprite.width * signSprite.anchor.x);
            y = this._textState.y + this._textState.height + this.padding;
        }
        return {x: x, y: y};
    };

    Window_NovelMessage.prototype.terminateMessage = function() {
        _InterfaceWindow_Message.prototype.terminateMessage.apply(this, arguments);
        if (!this._windowClosing) {
            this.open();
        } else {
            $gameSystem.executeAutoSave();
        }
    };

    Window_NovelMessage.prototype.processNormalCharacter = function(textState) {
        if (paramVerticalWriting) {
            var c = textState.text[textState.index++];
            var w = this.textWidth(c);
            var x = this.contents.width - textState.y - (textState.height / 2 + w / 2);
            var y = textState.x;
            this.contents.drawText(c, x, y, w * 2, textState.height, 'left');
            textState.x += this.contents.fontSize;
        } else {
            _InterfaceWindow_Message.prototype.processNormalCharacter.apply(this, arguments);
        }
        if (paramAutoWordWrap) {
            this.processAutoWordWrap(textState);
        }
    };

    Window_NovelMessage.prototype.processNewLine = function(textState) {
        textState.left            = this.newLineX();
        this._signPositionNewLine = this.getPauseSignSpritePosition();
        _InterfaceWindow_Message.prototype.processNewLine.apply(this, arguments);
        this._signPositionNewLine = null;
    };

    Window_NovelMessage.prototype.newLineX = function() {
        var x = _InterfaceWindow_Message.prototype.newLineX.apply(this, arguments);
        return (this._textState.y - this._textState.top >= Window_Base._faceHeight) ? 0 : x;
    };

    Window_NovelMessage.prototype.processAutoWordWrap = function(textState) {
        var c         = textState.text[textState.index];
        var textNextX = textState.x + (c ? this.textWidth(c) : 0);
        var index = textState.index;
        if (c === '\x1b' && this.obtainEscapeCode(textState) === 'I') {
            textNextX = textState.x + Window_Base._iconWidth;
        }
        textState.index = index;
        var maxWidth  = (paramVerticalWriting ? this.contents.height : this.contents.width);
        if (textNextX > maxWidth && c !== '\n') {
            textState.index--;
            this.processNewLine(textState);
        }
    };

    Window_NovelMessage.prototype.drawMessageFace = function() {
        if (!this._prevTextState || !this._textState) {
            _InterfaceWindow_Message.prototype.drawMessageFace.apply(this, arguments);
        } else {
            this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, this._textState.y);
        }
    };

    Window_NovelMessage.prototype.getNovelChoiceTop = function() {
        if (this._textState) {
            return this.y + this._textState.y + this._textState.height + this.padding;
        } else {
            return this.y;
        }
    };

    Window_NovelMessage.prototype.setWindowClosing = function() {
        this._windowClosing = true;
    };

    Window_NovelMessage.prototype.closeForce = function() {
        this.commitMessage();
        this.setWindowClosing();
        this.close();
    };

    Window_NovelMessage.prototype.commitMessage = function() {
        $gameSystem.executeAutoSave();
        this.clearDumpMessage();
    };

    Window_NovelMessage.prototype.isNovelWindow = function() {
        return true;
    };

    Window_NovelMessage.prototype.isNormalMessageWindow = function() {
        return false;
    };

    Window_NovelMessage.prototype.doesContinue = function() {
        return Window_Message.prototype.doesContinue.apply(this, arguments) || !this._windowClosing;
    };

    Window_NovelMessage.prototype.needsNewPage = function(textState) {
        if (paramVerticalWriting) {
            return (!this.isEndOfText(textState) && textState.y + textState.height > this.contents.width);
        } else {
            return Window_Message.prototype.needsNewPage.apply(this, arguments);
        }
    };

    //=============================================================================
    // Window_NovelChoiceList
    //  ノベルウィンドウ用のコマンド表示クラスです。
    //=============================================================================
    function Window_NovelChoiceList() {
        this.initialize.apply(this, arguments);
    }

    Window_NovelChoiceList._prefixAlphabet = ['A. ', 'B. ', 'C. ', 'D. ', 'E. ', 'F. ', 'G. ', 'H. '];
    Window_NovelChoiceList._prefixNumber   = ['1. ', '2. ', '3. ', '4. ', '5. ', '6. ', '7. ', '8. '];

    Window_NovelChoiceList.prototype             = Object.create(Window_ChoiceList.prototype);
    Window_NovelChoiceList.prototype.constructor = Window_NovelChoiceList;

    Window_NovelChoiceList.prototype.updatePlacement = function() {
        this.move(this.windowX(), this.windowY(), this.windowWidth(), this.windowHeight());
        this.moveCustomPosition();
    };

    Window_NovelChoiceList.prototype.standardFontSize    = Window_NovelMessage.prototype.standardFontSize;
    Window_NovelChoiceList.prototype.standardFontFace    = Window_NovelMessage.prototype.standardFontFace;
    Window_NovelChoiceList.prototype.processAutoWordWrap = Window_NovelMessage.prototype.processAutoWordWrap;

    Window_NovelChoiceList.prototype.windowX = function() {
        return this._messageWindow.x;
    };

    Window_NovelChoiceList.prototype.windowY = function() {
        return this._messageWindow.getNovelChoiceTop();
    };

    Window_NovelChoiceList.prototype.moveCustomPosition = function() {
        var position = $gameSystem.getNovelCommandPosition();
        if (position) {
            this.x = position.x - this.windowWidth() / 2;
            this.y = position.y - this.windowHeight() / 2;
        }
    };

    Window_NovelChoiceList.prototype.windowWidth = function() {
        return this._messageWindow.width;
    };

    Window_NovelChoiceList.prototype.windowHeight = function() {
        return this._messageWindow.height;
    };

    Window_NovelChoiceList.prototype.contentsHeight = function() {
        return this.getAllTextHeight() || Window_Base.prototype.contentsHeight.apply(this, arguments);
    };

    Window_NovelChoiceList.prototype.numVisibleRows = function() {
        return $gameMessage.choices().length;
    };

    Window_NovelChoiceList.prototype.updateBackground = function() {
        this.setBackgroundType(this.getNovelBackgroundType());
    };

    Window_NovelChoiceList.prototype.getNovelBackgroundType = function() {
        return !!$gameSystem.getNovelCommandPosition() ? 0 : 2;
    };

    Window_NovelChoiceList.prototype.makeCommandList = function() {
        _InterfaceWindow_ChoiceList.prototype.makeCommandList.apply(this, arguments);
        this._textHieghts = [];
        for (var i = 0, n = this._list.length; i < n; i++) {
            this._textHieghts[i] = this.drawItem(i) + 8;
        }
    };

    Window_NovelChoiceList.prototype.commandName = function(index) {
        var prefix = '';
        switch (paramSelectionPrefix) {
            case 1:
                prefix = Window_NovelChoiceList._prefixAlphabet[index];
                break;
            case 2:
                prefix = Window_NovelChoiceList._prefixNumber[index];
                break;
        }
        return prefix + Window_Command.prototype.commandName.apply(this, arguments);
    };

    Window_NovelChoiceList.prototype.getAllTextHeight = function() {
        return this._textHieghts.reduce(function(preValue, value) {
            return preValue + value;
        }, 0);
    };

    Window_NovelChoiceList.prototype.itemRect = function(index) {
        var rect = _InterfaceWindow_ChoiceList.prototype.itemRect.apply(this, arguments);
        rect.y   = 0;
        for (var i = 0; i < index; i++) {
            rect.y += this._textHieghts[i];
        }
        rect.height = this._textHieghts[index];
        return rect;
    };

    Window_NovelChoiceList.prototype.drawItem = function(index) {
        var rect         = this.itemRectForText(index);
        var textState    = {index: 0, x: rect.x, y: rect.y, left: rect.x};
        textState.text   = this.convertEscapeCharacters(this.commandName(index));
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
            this.processAutoWordWrap(textState);
        }
        return textState.y + textState.height - rect.y;
    };

    Window_NovelChoiceList.prototype.callOkHandler = function() {
        this._messageWindow.commitMessage();
        _InterfaceWindow_ChoiceList.prototype.callOkHandler.apply(this, arguments);
    };

    Window_NovelChoiceList.prototype.callCancelHandler = function() {
        this._messageWindow.commitMessage();
        _InterfaceWindow_ChoiceList.prototype.callCancelHandler.apply(this, arguments);
    };

    Window_NovelChoiceList.prototype.textPadding = function() {
        return 24;
    };

    //=============================================================================
    // Window_NovelChoiceList
    //  ノベルウィンドウ用のコマンド表示クラスです。
    //=============================================================================
    function Window_NovelNumberInput() {
        this.initialize.apply(this, arguments);
    }

    Window_NovelNumberInput.prototype             = Object.create(Window_NumberInput.prototype);
    Window_NovelNumberInput.prototype.constructor = Window_NovelNumberInput;

    Window_NovelNumberInput.prototype.standardFontSize = Window_NovelMessage.prototype.standardFontSize;
    Window_NovelNumberInput.prototype.standardFontFace = Window_NovelMessage.prototype.standardFontFace;

    Window_NovelNumberInput.prototype.moveCustomPosition = Window_NovelChoiceList.prototype.moveCustomPosition;
    Window_NovelNumberInput.prototype.updateBackground   = Window_NovelChoiceList.prototype.updateBackground;
    Window_NovelNumberInput.prototype.updateBackground   = Window_NovelChoiceList.prototype.getNovelBackgroundType;

    Window_NovelNumberInput.prototype.updatePlacement = function() {
        var y = this._messageWindow.getNovelChoiceTop();
        var x = Graphics.boxWidth / 2 - this.windowWidth() / 2;
        this.move(x, y, this.windowWidth(), this.windowHeight());
        this.moveCustomPosition();
        this.updateBackground();
    };

    Window_NovelNumberInput.prototype.processOk = function() {
        this._messageWindow.commitMessage();
        _InterfaceWindow_NumberInput.prototype.processOk.apply(this, arguments);
    };

    //=============================================================================
    // Window_NovelTitleCommand
    //  ノベルゲーム風のタイトルコマンドウィンドウです。
    //=============================================================================
    function Window_NovelTitleCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_NovelTitleCommand.prototype             = Object.create(Window_TitleCommand.prototype);
    Window_NovelTitleCommand.prototype.constructor = Window_NovelTitleCommand;

    Window_NovelTitleCommand.prototype.maxCols = function() {
        return this.maxItems();
    };

    Window_NovelTitleCommand.prototype.windowWidth = function() {
        return Graphics.boxWidth - 64;
    };

    Window_NovelTitleCommand.prototype.updatePlacement = function() {
        _InterfaceWindow_TitleCommand.prototype.updatePlacement.apply(this, arguments);
        this.setBackgroundType(1);
    };

    Window_NovelTitleCommand.prototype.standardFontSize = Window_NovelMessage.prototype.standardFontSize;
    Window_NovelTitleCommand.prototype.standardFontFace = Window_NovelMessage.prototype.standardFontFace;

    //=============================================================================
    // Window_PauseMenu
    //  イベント中ポーズメニュー表示用のクラスです。
    //=============================================================================
    function Window_PauseMenu() {
        this.initialize.apply(this, arguments);
    }

    Window_PauseMenu.prototype             = Object.create(Window_Command.prototype);
    Window_PauseMenu.prototype.constructor = Window_PauseMenu;

    Window_PauseMenu.prototype.initialize = function() {
        var x = (Graphics.boxWidth - this.windowWidth()) / 2;
        var y = (Graphics.boxHeight - this.windowHeight()) / 2;
        Window_Command.prototype.initialize.call(this, x, y);
        this.openness = 0;
        this.hide();
    };

    Window_PauseMenu.prototype.windowWidth = function() {
        return 240;
    };

    Window_PauseMenu.prototype.numVisibleRows = function() {
        return 6;
    };

    Window_PauseMenu.prototype.makeCommandList = function() {
        this.addCommand(TextManager.save, 'save');
        this.addCommand(paramCommandLoad, 'load');
        this.addCommand(paramCommandQuickSave, 'quickSave');
        this.addCommand(paramCommandQuickLoad, 'quickLoad');
        this.addCommand(TextManager.toTitle, 'toTitle');
        this.addCommand(TextManager.cancel, 'cancel');
    };

    Window_PauseMenu.prototype.playOkSound = function() {
        if (this.index() === 2 || this.index() === 3) return;
        Window_Selectable.prototype.playOkSound.apply(this, arguments);
    };

    //=============================================================================
    // ウィンドウを透過して重なり合ったときの表示を自然にします。
    //=============================================================================
    if (!WindowLayer.throughWindow) {
        WindowLayer.throughWindow = true;
        //=============================================================================
        //  WindowLayer
        //   ウィンドウのマスク処理を除去します。
        //=============================================================================
        WindowLayer.prototype._maskWindow            = function(window) {};
        WindowLayer.prototype._canvasClearWindowRect = function(renderSession, window) {};
    }
})();

