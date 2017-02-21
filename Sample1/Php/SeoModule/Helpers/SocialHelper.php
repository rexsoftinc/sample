<?php namespace Modules\Seo\Helpers;

/**
 * Class SocialHelper
 * @package Modules\Seo\Helpers
 */
class SocialHelper
{
	/**
	 * @param array $data
	 * @return array
	 */
	public static function getShareUrls($data)
	{
		$links = [
			'facebook' => [
				'url' => 'https://facebook.com/sharer/sharer.php',
				'query' => [
					'u' => $data['source']
				]
			],
			'linkedin' => [
				'url' => 'https://linkedin.com/shareArticle',
				'query' => [
					'mini' => 'true',
					'url' => $data['source'],
					'source' => $data['source'],
					'title' => $data['title'],
					'summary' => (isset($data['summary.linkedin'])) ? $data['summary.linkedin'] : $data['summary'],
				]
			],
			'twitter' => [
				'url' => 'https://twitter.com/intent/tweet',
				'query' => [
					'url' => $data['source'],
					'text' => (isset($data['summary.twitter'])) ? $data['summary.twitter'] : $data['summary']
				]
			]
		];

		foreach ($links as $key => $item) {
			$links[$key] = $item['url'] . '?' . http_build_query($item['query']);
		}

		return $links;
	}
}

?>