(function(scope) {
  class KeyframeEffect {
    constructor(target, keyframes, options) {
      this.target = target;
      this.keyframes = keyframes;
      this.options = options;
    }
  };

  class GroupEffect {
    // TODO: ctor should take an optional timing
    // TODO: Constructing GroupEffect via base class should be forbidden.
    constructor(effects) {
      this.children = effects;
    }
  };

  class ParallelEffect extends GroupEffect {
    constructor(effects) {
      super(effects);
      if (effects.length == 0)
        return;
    }
  };

  class SequenceEffect extends GroupEffect {
    constructor(effects) {
      super(effects);
      if (effects.length == 0)
        return;
      var accu_delay = this.children[0].options.delay ? this.children[0].options.delay : 0;
      for (let i = 1; i < this.children.length; ++i) {
        if (this.children[i].options.delay)
          accu_delay += this.children[i].options.delay;

        accu_delay += this.children[i-1].options.duration;
        this.children[i].options.delay = accu_delay;
      }
    }
  };
 
  class StaggerEffect extends GroupEffect {
    constructor(effects, stagger_options) {
      super(effects);
      if (effects.length == 0)
        return;
      var emanation = stagger_options.emanation;
      if (emanation < 0 || emanation >= this.children.length)
        return;
      for (let i = 0; i < this.children.length; ++i) {
        var delay = 0;
        if (this.children[i].options.delay)
          delay += this.children[i].options.delay;
        this.children[i].options.delay = delay +
            this.calculateDistance(emanation, i, stagger_options) * stagger_options.delay;
        this.children[i].options.easing = stagger_options.easing;
      }
    }

    calculateDistance(emanation, target, stagger_options) {
      var row = 1, col = this.children.length;
      if (stagger_options.grid) {
        row = stagger_options.grid[0];
        col = stagger_options.grid[1];
      } 
      var x1 = emanation % col;
      var y1 = Math.floor(emanation / col);

      var x2 = target % col;
      var y2 = Math.floor(target / col);

      return Math.sqrt(Math.pow(Math.abs(x1-x2),2) + Math.pow(Math.abs(y1-y2),2));
    }
  };

  class Animation {
    constructor(effect) {
      this.effect = effect;
    }

    playGroupEffect(group_effect) {
      for (let i = 0; i< group_effect.children.length; ++i) {
        let effect = group_effect.children[i];
        if (effect instanceof GroupEffect) {
          this.playGroupEffect(effect);
        } else { 
          effect.target.animate(effect.keyframes, effect.options);
        }
      }
    }

    play() {
      if (this.effect instanceof Array) {
        this.effect = new ParallelEffect(this.effect);
      }
      this.playGroupEffect(this.effect);
    }
  };

  scope.KeyframeEffect = KeyframeEffect;
  scope.GroupEffect = GroupEffect;
  scope.ParallelEffect = ParallelEffect;
  scope.SequenceEffect = SequenceEffect;
  scope.StaggerEffect = StaggerEffect;
  scope.Animation = Animation;

})(self);
