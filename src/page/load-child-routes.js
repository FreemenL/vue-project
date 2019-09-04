let childRoutes = [];
const childRouter = require.context('./',true,/v-router\.(js)$/);

childRouter.keys().forEach((item)=>{
	let modules;
	try{
		modules = childRouter(item).default;
	}catch(err){
		throw new Error(`${item}:${err}`);
	}
	if(typeof modules=="undefined"|| !Array.isArray(modules)){
		throw new Error(`${item} : Not exporting modules by way of 'export default 'OR The exported module is not an array!`);
	}
	Array.prototype.push.call(childRoutes,...modules);
})

export default childRoutes;