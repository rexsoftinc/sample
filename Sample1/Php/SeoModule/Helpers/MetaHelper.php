<?php namespace Modules\Seo\Helpers;

use Modules\Seo\Entities\Meta;
use Modules\Seo\Helpers\SocialHelper;
/**
 * Class MetaHelper
 * @package Modules\Seo\Helpers
 */
class MetaHelper
{

	/**
	 * @param bool|int|string $page
	 * @param bool|int|string $entityId
	 * @return array
	 */
	public static function get($page = FALSE, $entityId = FALSE)
	{
		return Meta::get($page, $entityId);
	}

	/**
	 * @param bool|int|string $page
	 * @param bool|int|string $entityId
	 * @return string
	 */
	public static function render($page = FALSE, $entityId = FALSE)
	{
		return Meta::render($page, $entityId);
	}

	/**
	 * @param bool|int|string $page
	 * @param bool|int|string $entityId
	 * @return array
	 */
	public static function getShareUrls($page = FALSE, $entityId = FALSE)
	{
		$data = Meta::get($page, $entityId);
		return SocialHelper::getShareUrls($data['share']);
	}
}

?>