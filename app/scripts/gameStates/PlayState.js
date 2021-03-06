define(['jquery','gameStates/BaseState','modules/SettingsModule','components/scoreControl',
  'text!templates/game.visibleDeck.html', 'text!templates/game.scoreControl.html'],
  function($, BaseState, Settings, scoreControlComp, visibleDeckHtml, scoreControlHtml){
  'use strict';
  function PlayState(game){
    BaseState.call(this, game, 'Play');
    this.nextState = 'Play';
  }

  PlayState.prototype = Object.create(BaseState.prototype);
  PlayState.prototype.constructor = PlayState;

  PlayState.prototype.templates = function(){
    var templates = BaseState.prototype.templates();
    templates.deck =  visibleDeckHtml;
    if(this.game.isScorePoints)
      templates.scoreControl = scoreControlHtml;
    return templates;
  };

  PlayState.prototype.init = function(){
    this.p1.maxPoints = 15;
    this.p1.availablePoints = setAvailablePoints(this.p1.maxPoints);
    if(!this.p1.playRules.hasPlayableCards(this.p1))
      this.game.$action = {text:'Go'};

    if(!isEndOfRound.call(this)){
      setInitialCurrentPlayer.call(this);
      if(this.game.currentPlayer === this.p2)
        processAiTurn.call(this);
    }

    setAction.call(this);

    this.render();
  };

  PlayState.prototype.selectCard = function(options) {
    try {
      if(Settings.get('action-confirmation')){
        this.p1.selectCard(options.index);
        this.mediator.publish('messages-add', 'Tap OK to continue');
        this.game.$action = {text:'Ok'};
        this.render();
      }
      else if(Settings.get('manual-count') && this.game.$action.text === '...'){
        this.p1.selectCard(options.index);
        this.mediator.publish('messages-add', 'Tap OK to continue');
        this.game.$action = {text:'Ok'};
        selectCardForPlay.call(this, options.index);
      } else if(this.game.$action.text === '...'){
        playCard.call(this, options.index);
      } else {
        this.mediator.publish('messages-add', 'No Playable Cards, Press \'Go!\'');
        this.render();
      }
    } catch(e) {
      if(e.message === 'No Playable Cards')
        this.mediator.publish('messages-add', 'No Playable Cards, Press \'Go!\'');
      else if(e.message === 'Invalid Playable Card')
        this.mediator.publish('messages-add', 'Try another card');

      this.mediator.publish('transition', 'Play', false);
    }
  };

  PlayState.prototype.action = function() {
    var index = this.p1.hand.indexOf(this.p1.getSelectedCards()[0]);

    //end of round
    if(this.nextState === 'Count'){
      this.mediator.publish('board-clear');
      this.mediator.publish('transition', this.nextState, false);
      this.nextState = 'Play';
      return;
    } else if(this.game.isScorePoints){
      playCard.call(this);//manual points enabled, manual Points value selected
      return;
    }
    else if(!this.p1.playRules.hasPlayableCards(this.p1)){
      //announce go
      this.p1.announceGo();
      switchPlayer.call(this);
      finishTurn.call(this);
      return;
    }
    else if(Settings.get('manual-count') && Settings.get('action-confirmation') && index !== -1 && !this.game.isScorePoints){
      selectCardForPlay.call(this, index);
      return;
    } else if(index !== -1){
      playCard.call(this, index);//manual Score disabled, autoSelect disabled
      return;
    }
    this.mediator.publish('messages-add', 'You can\'t go, you have playable cards.');
    this.render();
  };

  PlayState.prototype.bindEvents = function(){
    //bind defaults
    BaseState.prototype.bindEvents.call(this);

    scoreControlComp.init(this.p1);
  };

  function setAvailablePoints(size){
    var i = 0;
    var arrayPoints = [];
    while(i < size){
      i++;
      arrayPoints.push(i);
    }
    return arrayPoints;
  }

  function finishTurn(){
    if(this.p1.isWinner())
      this.mediator.publish('transition', 'Summary', true);
    else if(!isEndOfRound.call(this)){
      this.nextState = 'Play';
      this.mediator.publish('transition', 'Play', false);
    } else {
      this.mediator.publish('transition', 'Play', false);
    }
  }

  function selectCardForPlay(index){
    this.p1.selectedScore = 0;
    this.game.isScorePoints = true;
    this.p1.placeCardOnTable(index);
    this.render();
  }

  function playCard(index){
    this.game.isScorePoints = false;
    this.p1.playCard(index);
    switchPlayer.call(this);
    finishTurn.call(this);
  }

  function switchPlayer(){
    this.game.currentPlayer = this.p2;
    if(!isEndOfRound.call(this))
      this.game.$action = {text:'...'};
  }


  function setInitialCurrentPlayer(){
    if(!this.game.currentPlayer){
      this.game.isScorePoints = false;
      if(this.game.$cribOwner === this.p1){
        this.game.currentPlayer = this.p2;
      } else {
        this.game.currentPlayer = this.p1;
      }
    }
  }

  function processAiTurn(){
    try{
      this.p2.playCard();
      this.game.currentPlayer = this.p1;
      if(!isEndOfRound.call(this))
        this.game.$action = {text:'...'};

      if(this.p2.isWinner())
        this.mediator.publish('transition', 'Summary', true);
    } catch(e){
      console.log(e);
    }
  }

  function setAction(){
    if(isEndOfRound.call(this)){
      this.mediator.publish('messages-add', 'Round over!');
      this.game.$action = {text:'Ok'};
      this.nextState = 'Count';
      this.game.currentPlayer = undefined;
    }
    else if(!this.p1.playRules.hasPlayableCards(this.p1))
    {
      this.game.$action = {text:'Go'};
    }
  }

  function isEndOfRound(){
    return this.p1.hand.length === 0 && this.p2.hand.length === 0;
  }

  return PlayState;
});
