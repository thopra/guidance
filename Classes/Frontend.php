<?php
namespace Thopra\Guidance;

class Frontend {

	protected $configFile = false;

	protected $config = array();

	protected $styleguide;

	public function __construct($configFile = false)
	{
		if ($configFile) {
			$this->setConfigFile($configFile);
		}

		$this->styleguide = new \Thopra\Styleguide\Styleguide();
	}

	public function render()
	{
		$this->getConfig();
		$this->styleguide->setTitle($this->config['title']);
		if ($this->config['cache']['enable']) {
			$this->styleguide->setCacheDir(dirname($this->configFile).'/'.$this->config['cache']['dir']);
			$this->styleguide->setCacheLifetime($this->config['cache']['lifetime']);
		}

		if (isset($this->config['settings']['navLevels'])) {
			$this->styleguide->setNavLevels((int)$this->config['settings']['navLevels']);
		}

		if (isset($this->config['settings']['brand'])) {
			$this->styleguide->setBrand($this->config['settings']['brand']);
		}

		if(is_array($this->config['sources'])) {
			foreach ($this->config['sources'] as $key => $sourceConf) {
				$source = new \Thopra\Styleguide\Source\Source(dirname($this->configFile).'/'.$sourceConf['dir'], $sourceConf['key'], $sourceConf['title']);
				$source->setPartialDir(realpath(dirname($this->configFile)).'/'.$sourceConf['partialDir']);
				if(is_array($sourceConf['resources'])) {
					foreach ($sourceConf['resources'] as $key => $resource) {
						if (is_string($resource)) {
							$source->addResource($resource);
						} elseif(is_array($resource)) {
							$source->addResource($resource['path'], $resource['type']);
						}
					}
				}
				
				if (isset($sourceConf['partialType'])) {
					$source->setPartialType($sourceConf['partialType']);
				}
				$this->styleguide->addSource($source);
			}
		}
		$this->styleguide->setDefaultTemplateDir('guidance/Templates');
		$this->styleguide->setTemplateDir( $this->styleguide->getDefaultTemplateDir() );
		if ($this->config['settings']['templateDir']) {
			$this->styleguide->setTemplateDir($this->config['settings']['templateDir']);
		}
		
		$this->styleguide->render();
	}

	public function setConfigFile($path)
	{
		$this->configFile = $path;
	}

	protected function getConfig()
	{
		if (!$this->configFile) {
			throw new \Exception("No configuration found. You have to setup a config file and apply it with setConfigFile()");
		}

		if (!file_exists($this->configFile)) {
			throw new \Exception("No configuration found. Configuration file does not exist.");
		}

		$localConfig = json_decode(file_get_contents($this->configFile), true);

		$this->config = array_replace_recursive($this->getDefaultConfiguration(), $localConfig);
	}

	protected function getDefaultConfiguration()
	{
		return json_decode(file_get_contents(dirname(__DIR__).'/guidance.defaults.json'), true);
	}
}