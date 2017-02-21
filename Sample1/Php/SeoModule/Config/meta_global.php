<?php

return [
	
	'suffix' => ' | CommunicationsMatch',
	'props_to_add_suffix' => [
		'title',
		'og:title',
		'twitter:title'
	],
	
	'global' => [
		'title' => 'CommunicationsMatch',
		'description' => 'Connecting companies with communications professionals',
		'keywords' => '',
		
		// FACEBOOK META
		'og:locale' => 'en_US',
		'og:type' => 'website',
		'og:title' => 'CommunicationsMatch',
		'og:description' => 'CommunicationsMatch™ is a new matching search engine that enables business leaders to find U.S. and international communications agencies and professionals by name, industry sector, expertise, location and size.',
		'og:url' => URL::to('/'),
		'og:site_name' => 'CommunicationsMatch.com',
		'og:image' => URL::to('/assets/logo-facebook.jpg'),
		
		// TWITTER META
		'twitter:card' => 'summary_large_image',
		'twitter:creator' => '@CommMatch',
		'twitter:title' => 'CommunicationsMatch',
		'twitter:description' => 'CommunicationsMatch™ is a new matching search engine that enables business leaders to find U.S. and international communications agencies and professionals by name, industry sector, expertise, location and size.',
		'twitter:image' => URL::to('/assets/logo-twitter.jpg'),
		'share' => [
			'source' => URL::to('/'),
			'title' => 'CommunicationsMatch',
			'summary' => 'CommunicationsMatch™ is a new matching search engine that enables business leaders to find U.S. and international communications agencies and professionals by name, industry sector, expertise, location and size.',
			'summary.twitter' => 'New tool to search for communications companies and people by name, industry sector, expertise, location and size: www.communicationsmatch.com'
		]
	]
];