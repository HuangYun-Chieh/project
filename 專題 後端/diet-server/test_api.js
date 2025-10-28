(async ()=>{
  try{
    const reg = await fetch('http://localhost:3000/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username:'tester1', password:'pass123', nickname:'測試'}) });
    console.log('reg status', reg.status);
    const r1 = await reg.json(); console.log('reg body', r1);
    const token = r1.token;
    const save = await fetch('http://localhost:3000/api/goals', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({goalType:'減脂', dailyCalories:1500}) });
    console.log('save status', save.status); console.log(await save.json());
    const get = await fetch('http://localhost:3000/api/goals', { headers: {'Authorization':'Bearer '+token} });
    console.log('get status', get.status); console.log(await get.json());
  }catch(e){console.error('err',e)}
})();
