<head>
    <meta charset="utf-8"/>
    
    @yield('meta', MetaHelper::render())
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link href='//fonts.googleapis.com/css?family=Roboto+Condensed:400,300,700' rel='stylesheet' type='text/css' />
    <!--[if lte IE 9]><meta http-equiv="X-UA-Compatible" content="IE=edge" /><![endif]-->

	<script type="text/javascript">
	var appID = '';
	var Routes = {!! \ViewHelper::getJsRoutes() !!};
	</script>
	
	@yield('scripts')
	
</head>
