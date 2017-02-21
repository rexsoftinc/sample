<?php

return [
	//gen 
	'page' => FALSE, // String
	'offset' => 0, // String
	'type' => FALSE, // String
	'order' => FALSE, // String
	'alpha' => FALSE, // String
	
	//criterias
	'sectors' => [], // Model
	'expertises' => [],  // Model
	
	//locations
	'location' => FALSE,  // String
	'country' => FALSE,  // Model
	'state' => FALSE,  // Model
	'city' => FALSE,  // Model
	'zip' => FALSE,  // String
	'miles' => FALSE, // Model
	
	//clients
	'clients_keywords' => FALSE, // String
	'clients_sectors' => [], // Model
	
	//morph		
	'keywords' => FALSE, // String
	'size' => FALSE, // Model
	'is_mainoffice' => FALSE, // String
	'is_branch' => FALSE, // String
	'is_deverse' => FALSE, // String
	'is_women' => FALSE, // String
	'exclude' => FALSE // String
];