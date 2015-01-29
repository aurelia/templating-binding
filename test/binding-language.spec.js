import {InterpolationBindingExpression} from '../src/binding-language';

describe('interpolation binding', () => {  
  describe('interpolate', () => {
    var observerLocator, targetProperty, accessScope, parts, myViewModel;

    class ObserverLocator{
        getObserver(target, targetPropert){};
    }

    class AccessScope{
      constructor(name){
        this.name = name;
      };

      evaluate(){}   
    }

    class FooProperty{
      setValue(value){
        this.value = value;
      }
    }

    class MyViewModel{
      constructor(){
        this.fooCount;
      }
    }

    beforeEach(() => {
      observerLocator = new ObserverLocator();
      targetProperty = new FooProperty();   
      myViewModel = new MyViewModel    
      accessScope = new AccessScope('fooCount');
      parts = ['', accessScope];

      spyOn(observerLocator, 'getObserver').and.returnValue(targetProperty);      
    });

    it('interpolates undefined to empty string', ()=> {         

      myViewModel.fooCount = undefined;  

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding();
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('');
    });

    it('interpolates null to empty string', ()=> {         

      myViewModel.fooCount = null;  

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding();
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('');
    }); 

    it('interpolates number 0 to string', ()=> {         

      myViewModel.fooCount = 0;  

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding();
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('0');
    });

    it('can interpolate string to string', ()=> {         

      myViewModel.fooCount = "Martin";  

      spyOn(accessScope, 'evaluate').and.returnValue(myViewModel.fooCount);

      var interpolationBindingExpression = new InterpolationBindingExpression(observerLocator, targetProperty, parts);
      var interpolationBinding = interpolationBindingExpression.createBinding();
      interpolationBinding.bind(myViewModel);

      expect(targetProperty.value).toBe('Martin');
    });
  });
});