define(['gameStates/BaseState', 'text!templates/game.hiddenStraitDeck.html', 'text!templates/game.visibleDeck.html'],
  function(BaseState, hiddenStraitDeckHtml, visibleDeckHtml){
  'use strict';
  function PrePlayState(game){
    BaseState.call(this, game, 'PrePlay');
  }

  PrePlayState.prototype = Object.create(BaseState.prototype);
  PrePlayState.prototype.constructor = PrePlayState;

  function selectTopCard(index){
    var notCribOwner = (this.game.$cribOwner === this.game.$player1) ? this.game.$player2 : this.game.$player1;

    var card = this.game.$cribOwner.selectOneFromDeck(this.game.$deck, index);
    this.game.topCard = card;
    if(this.game.$cribOwner.isWinner())
      this.mediator.publish('transition', 'Summary');
    else{
      this.game.$showTopCard = true;
      this.mediator.publish('messages-add', notCribOwner.name + ' begin');
      this.mediator.publish('transition', 'Play', false);
    }
  }

  PrePlayState.prototype.templates = function(){
    var templates = BaseState.prototype.templates();
    if(this.game.$showTopCard)
      templates.deck = visibleDeckHtml;
    else
      templates.deck = hiddenStraitDeckHtml;
    return templates;
  };

  PrePlayState.prototype.init = function(){
    this.game.$action = {text: '...'};
    if(this.game.$cribOwner !== this.game.$player1){
      this.mediator.publish('messages-add', 'Cut the deck for your opponent');
      this.render();
    } else {
      this.mediator.publish('messages-add', 'They will cut the deck for you');
      var index = Math.floor(Math.random() * this.game.$deck.cards.length);
      this.render();
      setTimeout(function(){
        selectTopCard.call(this, index);
      }.bind(this), 1000);
    }
  };

  PrePlayState.prototype.deck = function(cardIndex) {
    selectTopCard.call(this, cardIndex);
  };

  return PrePlayState;
});
