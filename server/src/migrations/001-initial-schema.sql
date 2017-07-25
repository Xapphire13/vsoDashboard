-- up
CREATE TABLE UserStore (
  id integer PRIMARY KEY,
  oAuthId text UNIQUE,
  emailOverride text,
  pollIntervalInSecs integer);
CREATE TABLE UserPreference (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  vsoRepositoryId TEXT,
  justMine INTEGER,
  isMinimised INTEGER,
CONSTRAINT UserPreference_fk_userId FOREIGN KEY (userId)
REFERENCES UserStore (id) ON UPDATE CASCADE ON DELETE CASCADE);
CREATE TABLE UserSortPreference(
  id INTEGER PRIMARY KEY,
  preferenceId INTEGER,
  userId INTEGER,
  sortColumn INTEGER,
  isAssending INTEGER,
  presidence INTEGER,
CONSTRAINT UserSortPreference_fk_preferenceId FOREIGN KEY (preferenceId)
REFERENCES UserPreference (id) ON UPDATE CASCADE ON DELETE CASCADE,
CONSTRAINT UserSortPreference_fk_userId FOREIGN KEY (userId)
REFERENCES userStore (id) ON UPDATE CASCADE ON DELETE CASCADE);

CREATE INDEX UserStore_ix_oAuthId ON UserStore (oAuthId);
CREATE INDEX UserPreference_ix_vsoRepositoryId ON UserPreference (vsoRepositoryId);

-- DOWN
DROP INDEX UserStore_ix_oAuthId;
DROP INDEX UserPreference_ix_vsoRepositoryId;
DROP TABLE UserSortPreference;
DROP TABLE UserPreference;
DROP TABLE UserStore;