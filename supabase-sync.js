async function loadCloudSettings(){
  const c=window.STENA_SUPABASE;
  try{
    const r=await fetch(
      `${c.url}/rest/v1/site_settings?id=eq.1&select=data`,
      {
        headers:{
          apikey:c.key,
          Authorization:`Bearer ${c.key}`
        }
      }
    );

    if(!r.ok)return;

    const rows=await r.json(),
          remote=rows[0]?.data;

    if(!remote)return;

    const now=localStorage.getItem('stenaSettings');

    if(JSON.stringify(remote)!==now){
      localStorage.setItem(
        'stenaSettings',
        JSON.stringify(remote)
      );

      location.reload();
    }

  }catch(e){
    console.info(
      'Синхронизация Supabase пока недоступна'
    );
  }
}

loadCloudSettings();