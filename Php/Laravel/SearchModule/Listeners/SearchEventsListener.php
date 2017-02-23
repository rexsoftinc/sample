<?php namespace Modules\Search\Listeners;

/**
 * Class SearchEventsListener
 * @package Modules\Search\Listeners
 */
class SearchEventsListener 
{

    /**
     * @param $events
     */
	public function subscribe($events)
	{
		$events->listen('communicator.approved', 'Modules\Search\Listeners\SearchEventsListener@onCommunicatorApproved');
		$events->listen('communicator.subscribed', 'Modules\Search\Listeners\SearchEventsListener@onCommunicatorSubscribed');
	}

    /**
     * @param $communicatorType
     * @param $communicator
     */
	public function onCommunicatorApproved($communicatorType, $communicator) 
	{
		if(is_numeric($communicator)) {
			$communicator = Communicators::type($communicatorType)->get($communicator);
		}
		
		if($communicator->subscriber) {
			SearchController::addEntity($communicator, $communicatorType);
		}
	}

    /**
     * @param $communicatorType
     * @param $communicator
     */
	public function onCommunicatorSubscribed($communicatorType, $communicator) 
	{
		if(is_numeric($communicator)) {
			$communicator = Communicators::type($communicatorType)->get($communicator);
		}
		if($communicator->approved) {
			SearchController::addEntity($communicator, $communicatorType);
		}
	}
	
}