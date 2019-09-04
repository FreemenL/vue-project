export default [
	{
		path:'/login',
		component: ()=> import(
      /* webpackChunkName: "login" */
      "@page/login/login"
    ),
	}
]
