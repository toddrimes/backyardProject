//tocService : deliver menus

module.exports = {
    getTocEntries:function(req, res){
        
        var toc = [];
        if(req.originalUrl == '/'){
            if(!req.isAuthenticated()){
                toc = [
                	{name:'Login',		url:'/login'},
                	{name:'Register',	url:'/register'},
                	{name:'About',		url:'/about'}];
            }else{
                toc = [
                	{name:'Chat app',	url:'/chat'},
                	{name:'Test',		url:'/test'},
                	{name:'About',		url:'/about'}];
            }
        }else{
            if(!req.isAuthenticated()){
                toc = [
                	{name:'Home',		url:'/'},
                	{name:'Login',		url:'/login'},
                	{name:'Register',	url:'/register'},
                	{name:'Test',		url:'/test'},
                	{name:'About',		url:'/about'}];
            }else{
                toc = [
                	{name:'Home',		url:'/'},
                	{name:'Chat app',	url:'/chat'},
                	{name:'Test',		url:'/test'},
                	{name:'About',		url:'/about'}];
            }
        }
        return toc;
    }
}