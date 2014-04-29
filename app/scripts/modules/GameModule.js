define(['ui/ui', 'ui/ui.dialog', 'mediator'], function (ui, uiDialog, mediator) {
    'use strict';
    var deck, player1, player2;

    var state = {
      dealer: ''
    };

    function cutCards(){
      deck.shuffle();
      player1.hand = deck.cut();
      player2.hand = deck.cut();
      ui.cutCards({topHand: player2.hand, bottomHand: player1.hand});
    };

    //Events
    mediator.subscribe('game.cut', function(){
      do {
        cutCards();
        setTimeout(function(){
          if(player1.hand.value == player2.hand.value){
            uiDialog.alert('it\'s a tie! cut again');
          } else if(player1.hand.value < player2.hand.value){
            uiDialog.alert('player2 won the cut :(');
            state.dealer = player2;
            mediator.publish('game.deal');
          } else {
            uiDialog.alert('you won the cut!');
            state.dealer = player1;
            mediator.publish('game.deal');
          }
        }, 500);
      } while(player1.hand.value === player2.hand.value);
    });

    mediator.subscribe('game.deal', function(){
      deck.create();
      deck.shuffle();
      var hands = deck.deal();
      
      player1.hand = hands.bottomHand;
      player2.hand = hands.topHand;

      ui.dealHands(hands);

      setTimeout(function(){
        mediator.publish('game.deal.done');
      }, 500);
    });

    mediator.subscribe('game.deal.done', function(){
      if(state.dealer == player1) uiDialog.alert('place 2 cards in your crib');
      else uiDialog.alert('select 2 cards for the opponents crib');
    });

    return function Game(options){
      deck = options.deck;
      player1 = options.player1;
      player2 = options.player2;

      deck.create();
    };
});