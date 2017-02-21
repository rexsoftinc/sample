<?php namespace Modules\Search\Http\Controllers;

/**
 * Class SearchController
 * @package Modules\Search\Http\Controllers
 */
class SearchController extends Controller {

    /**
     * @param $entity
     * @param $type
     */
	public static function addEntity($entity, $type)
	{
		Self::processEntityMorph($entity, $type);
		Self::processEntityCategories($entity, $type);
		Self::processEntityLocation($entity, $type);
		Self::processEntityClients($entity, $type);
	}

    /**
     * @param $entity
     * @param $type
     */
	public static function removeEntity($entity, $type) 
	{
		SearchClients::where('entityId', $entity->id)->where('type', $type)->delete();
		Locations::where('entityId', $entity->id)->where('type', $type)->delete();
		Categories::where('entityId', $entity->id)->where('type', $type)->delete();
		Morph::where('entityId', $entity->id)->where('type', $type)->delete();
	}

    /**
     * @param $entity
     * @param $type
     */
	public static function processEntityMorph($entity, $type) 
	{
		$searchMorph = Morph::firstOrNew([
			'entityId' => $entity->id, 
			'type' => $type
		]);
		
		$keywords = '';
		
		if($type == 'company') {
			$people = [];
			$entityPeople = CompanyPerson::where('companyId', $entity->id)->get();
			foreach($entityPeople as $person) {
				$people[] = trim($person->firstName . ' ' . $person->lastName); 
			}
			
			$entityInfo = CompanyInfo::where('companyId', $entity->id);
			if($entityInfo->count() > 0) {
				$entityInfo = $entityInfo->first();
				$keywords = implode(' ', [
					$entity->name,
					$entityInfo->keywords,
					$entityInfo->additionalNotes,
					str_replace(["\n","\r"], '', strip_tags($entity->about)),
					implode(' ', $people)
				]);
			}
			
			$searchMorph->sizeId = $entity->sizeId;
			$searchMorph->mainOffice = $entity->international;
			$searchMorph->branch = $entity->branch;
			$searchMorph->deverse = $entityInfo->deverse;
			$searchMorph->women = $entityInfo->women;
			$searchMorph->title = trim($entity->name);
		}
		
		if($type == 'individual') {
			$entityInfo = PersonInfo::where('personId', $entity->id);
			if($entityInfo->count() > 0) {
				$entityInfo = $entityInfo->first();
				$keywords = implode(' ', [
					$entity->firstName,
					$entity->middleName,
					$entity->lastName,
					$entity->title,
					$entityInfo->keywords,
					$entityInfo->additionalNotes,
				]);
			}
			$searchMorph->title = trim($entity->firstName . ' ' . $entity->lastName);
		}
		
		$searchMorph->keywords = trim($keywords);
		$searchMorph->save();
	}

    /**
     * @param $entity
     * @param $type
     * @return bool
     */
	public static function processEntityCategories($entity, $type) 
	{
		$searchMorph = Morph::where('entityId', $entity->id)->where('type', $type)->first();
		if($searchMorph === null ) {
			return FALSE;
		}
		
		if($type == 'company') {
			$sectors = Company::find($entity->id)->sectors()->get();
			$expertises = Company::find($entity->id)->expertises()->get();
		} 
		
		if($type == 'individual') {
			$sectors = Person::find($entity->id)->sectors()->get();
			$expertises = Person::find($entity->id)->expertises()->get();
		}
		
		$items = [];
		foreach ($sectors as $sector) {
			foreach ($expertises as $expertise) {
				array_push($items, [
					'morphId' => $searchMorph->id,
					'entityId' => $entity->id,
					'sectorsId' => $sector->id, 
					'expertisesId' => $expertise->id, 
					'type' => $type, 
				]);
			}
		}
		Categories::where('morphId', '=', $searchMorph->id)->delete();
		Categories::insert($items);
	}

    /**
     * @param $entity
     * @param $type
     * @return bool
     */
	public static function processEntityLocation($entity, $type) 
	{
		$searchMorph = Morph::where('entityId', $entity->id)->where('type', $type)->first();
		if($searchMorph === null ) {
			return FALSE;
		}
		
		$searchLocation = Locations::firstOrNew([
			'morphId' => $searchMorph->id
		]);
		
		$searchLocation->entityId = $entity->id;
		$searchLocation->type = $type;
		$searchLocation->countryId = $entity->countryId;
		$searchLocation->stateId = $entity->stateId;
		$searchLocation->cityId = $entity->city;
		
		$location = Location::where('id', (int)$entity->city)->first();
		if(isset($location->id)) {
			$searchLocation['geoLat'] = $location->latitude;
			$searchLocation['geoLong'] = $location->longitude;
		}
		
		$searchLocation->save();
	}

    /**
     * @param $entity
     * @param $type
     * @return bool
     */
	public static function processEntityClients($entity, $type)
	{
		$searchMorph = Morph::where('entityId', $entity->id)->where('type', $type)->first();
		if($searchMorph === null ) {
			return FALSE;
		}
		
		if($type == 'company') {
			$clients = CompanyClient::where('companyId', '=', $entity->id);
		}
		if($type == 'individual') {
			$clients = PersonClient::where('personId', '=', $entity->id);
		}
		$clients = $clients->with('sectors')->get();
		foreach ($clients as $client) {
			Self::addEntityClient($type, $entity->id, $client);
		}
	}

    /**
     * @param $type
     * @param $entityId
     * @param $client
     * @return bool
     */
	public static function addEntityClient($type, $entityId, $client) 
	{
		$searchMorph = Morph::where('type', $type)->where('entityId', $entityId)->first();
		if($searchMorph === null ) {
			return FALSE;
		}
		
		$keywords = implode(' ', [
			$client->name,
			str_replace(["\n","\r"], '', strip_tags($client->caseStudy))
		]);
        
		foreach($client->sectors as $sector) {
			$item = SearchClients::firstOrNew([
				'morphId' => $searchMorph->id,
				'clientId' => $client->id,
				'sectorId' => $sector->id
			]);
			$item->entityId = $entityId;
			$item->type = $type;
			$item->keywords = $keywords;
			$item->save();
		}
	}

    /**
     * @param $type
     * @param $entityId
     * @param $id
     */
	public static function removeEntityClient($type, $entityId, $id) 
	{
		SearchClients::where('entityId', $entityId)->where('type', $type)->where('clientId', $id)->delete();
	}
	
}