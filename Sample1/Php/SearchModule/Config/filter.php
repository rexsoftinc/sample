<?php

return [
	'order' => 'relevance',
	'offset' => 0,
	'type' => FALSE,
	'alpha' => FALSE,
	'criterias' => [
		'sectors' => [],
		'expertises' => []
	],
	'locations' => [
		'location' => FALSE,
		'country' => FALSE,
		'state' => FALSE,
		'city' => FALSE,
		'zip' => FALSE,
		'miles' => FALSE
	],
	'clients' => [
		'clients_keywords' => FALSE,
		'clients_sectors' => []
	],
	'morph' => [
		'keywords' => FALSE,
		'size' => FALSE,
		'is_mainoffice' => FALSE,
		'is_branch' => FALSE,
		'is_deverse' => FALSE,
		'is_women' => FALSE,
		'exclude' => FALSE
	]
];