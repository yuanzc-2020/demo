
//vue 定义全局函数 
exports.install = function (Vue, options) {
    //全局方法
    Vue.prototype.changeData = function (){
      alert('执行成功');
    };
  };


