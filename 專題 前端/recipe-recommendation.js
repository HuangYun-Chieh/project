document.getElementById('recommend-btn').addEventListener('click', () => {
  const recipes = [
    { name: '番茄炒蛋', image: 'tomato-egg.jpg', description: '簡單又美味的家常菜' },
    { name: '青椒炒牛肉', image: 'beef-pepper.jpg', description: '營養豐富的快炒料理' },
    { name: '麻婆豆腐', image: 'mapo-tofu.jpg', description: '經典川菜，麻辣鮮香' },
  ];

  const randomRecipes = recipes.sort(() => 0.5 - Math.random()).slice(0, 2);

  const recipeList = document.getElementById('recipe-list');
  recipeList.innerHTML = randomRecipes.map(recipe => `
    <div class="recipe">
      <h3>${recipe.name}</h3>
      <img src="${recipe.image}" alt="${recipe.name}" style="width: 100px; height: 100px;">
      <p>${recipe.description}</p>
    </div>
  `).join('');
});
