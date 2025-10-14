CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_registered TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs (
  blog_id SERIAL PRIMARY KEY,
  creator_name VARCHAR(255),
  creator_user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT now()
);

INSERT INTO users (user_id, password, name)
VALUES
  ('bc22', 'bobcros', 'Bobby Crosby'),
  ('madbum', 'goingmad12', 'Madison Bumgarner'),
  ('TheFreak', 'timmyjim', 'Tim Linecum')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES
('Madison Bumgarner','madbum','World Series WInner','Just beat the royals, Easy win.', now() - interval '10 days'),
('Bobby Crosby','bc22','Lorem Ipsum or sum','I dont know what to put here. Looks cool though. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellent
', now() - interval '8 days'),
('Tim Lincecum','TheFreak','GOAT','I got 2 cy youngs. Put me in the HOF.', now() - interval '5 days'),
('Tim Lincecum','TheFreak','HOF Ballot','Put Barry Bonds in the hall of fame.', now() - interval '3 days'),
('Madison Bumgarner','madbum','HOF','Put Bonds in.', now() - interval '1 days')
ON CONFLICT DO NOTHING;

DELETE FROM blogs
WHERE blog_id NOT IN (
  SELECT MIN(blog_id)
  FROM blogs
  GROUP BY title, body, creator_user_id
);

