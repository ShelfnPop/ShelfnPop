update public.pop_catalog
set
  set_name = case
    when set_name in ('The Clone Wars', 'Star Wars: The Clone Wars') then 'Star Wars: The Clone Wars'
    when set_name in ('The Last Jedi', 'Star Wars: The Last Jedi') then 'Star Wars: The Last Jedi'
    when set_name in ('Star Wars: The Rise Of Skywalker', 'Star Wars: The Rise of Skywalker') then 'Star Wars: The Rise of Skywalker'
    when set_name in ('Star Wars Rogue One', 'Star Wars: Rogue One') then 'Star Wars: Rogue One'
    when set_name = 'Solo A Star Wars Story' then 'Solo: A Star Wars Story'
    when set_name = '40th The Empire Strikes Back Star Wars' then 'Star Wars: The Empire Strikes Back 40th Anniversary'
    when set_name = 'Star Wars: Return Of The Jedi 40th Anniversary' then 'Star Wars: Return of the Jedi 40th Anniversary'
    when set_name = 'Star Wars: Episode VI Return Of The Jedi' then 'Star Wars: Return of the Jedi'
    when set_name = 'Star Wars: Episode IV A New Hope' then 'Star Wars: A New Hope'
    when set_name = 'Star Wars: Episode III Revenge Of The Sith.Special Edition' then 'Star Wars: Revenge of the Sith'
    when set_name = 'TPM25' then 'Star Wars: The Phantom Menace 25th Anniversary'
    when set_name in ('Across the Galaxy', 'Star Wars: Across The Galaxy') then 'Star Wars: Across the Galaxy'
    else set_name
  end,
  api_last_updated = now()
where franchise = 'Star Wars'
  and set_name in (
    'The Clone Wars', 'Star Wars: The Clone Wars',
    'The Last Jedi', 'Star Wars: The Last Jedi',
    'Star Wars: The Rise Of Skywalker', 'Star Wars: The Rise of Skywalker',
    'Star Wars Rogue One', 'Star Wars: Rogue One',
    'Solo A Star Wars Story',
    '40th The Empire Strikes Back Star Wars',
    'Star Wars: Return Of The Jedi 40th Anniversary',
    'Star Wars: Episode VI Return Of The Jedi',
    'Star Wars: Episode IV A New Hope',
    'Star Wars: Episode III Revenge Of The Sith.Special Edition',
    'TPM25',
    'Across the Galaxy', 'Star Wars: Across The Galaxy'
  );
