exports.getResourceById = (req, res) => {
    const id = req.params.id;
    // 從數據庫獲取資源
    // 假設 resources 為數據庫的資料
    const resource = resources.find(r => r.id == id);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).send('Resource not found');
    }
  };
  
  exports.createResource = (req, res) => {
    const newResource = {
      id: resources.length + 1,
      name: req.body.name,
      value: req.body.value,
    };
    resources.push(newResource);
    res.status(201).json(newResource);
  };
  
  exports.updateResource = (req, res) => {
    const id = req.params.id;
    const resource = resources.find(r => r.id == id);
    if (resource) {
      resource.name = req.body.name;
      resource.value = req.body.value;
      res.json(resource);
    } else {
      res.status(404).send('Resource not found');
    }
  };
  
  exports.deleteResource = (req, res) => {
    const id = req.params.id;
    const resourceIndex = resources.findIndex(r => r.id == id);
    if (resourceIndex >= 0) {
      resources.splice(resourceIndex, 1);
      res.sendStatus(204);
    } else {
      res.status(404).send('Resource not found');
    }
  };
  