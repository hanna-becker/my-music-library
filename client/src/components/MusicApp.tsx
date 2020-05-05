import { History } from 'history'
import * as React from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { addSong, deleteSong, getSongs, searchSong } from '../api/songs-api'
import Auth from '../auth/Auth'
import { SearchResult } from '../types/SearchResult'
import { AddableSearchResult } from '../types/AddableSearchResult'
import { LibrarySong } from '../types/LibrarySong'

interface MusicAppProps {
  auth: Auth
  history: History
}

interface MusicAppState {
  searchResults: SearchResult[]
  addableSearchResults: AddableSearchResult[]
  librarySongs: Set<LibrarySong>
  searchTerm: string
  loadingSongs: boolean
  loadingSearchResults: boolean
}

export class MusicApp extends React.PureComponent<MusicAppProps, MusicAppState> {
  state: MusicAppState = {
    searchResults: [],
    addableSearchResults: [],
    librarySongs: new Set([]),
    searchTerm: '',
    loadingSongs: true,
    loadingSearchResults: false
  }

  private setAddableSearchResultsState() {
    const addableSearchResults = this.state.searchResults.map(result => {
      const trackIds = [...this.state.librarySongs].map(song => song.trackId)
      return {
        ...result,
        addable: !trackIds.includes(result.id)
      }
    })
    this.setState({
      addableSearchResults,
      loadingSearchResults: false
    })
  }

  handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value })
  }

  onSubmitSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    this.setState({ loadingSearchResults: true })
    try {
      const searchResults = await searchSong(this.props.auth.getIdToken(), this.state.searchTerm)
      this.setState({
        searchResults
      })
      this.setAddableSearchResultsState()
    } catch {
      alert('Song search failed')
    }
  }

  handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      this.onSubmitSearch(event)
    }
  }

  onSongDelete = async (trackId: string) => {
    try {
      await deleteSong(this.props.auth.getIdToken(), trackId)
      this.setState({
        librarySongs: new Set([...this.state.librarySongs].filter(song => song.trackId != trackId))
      })
      this.setAddableSearchResultsState()
    } catch {
      alert('Song deletion failed')
    }
  }

  onSongAdd = async (trackId: string) => {
    try {
      await addSong(this.props.auth.getIdToken(), trackId)
      const librarySongs = new Set([...this.state.librarySongs, { trackId, iframeLoaded: false }])
      this.setState({
        librarySongs
      })
      this.setAddableSearchResultsState()
    } catch {
      alert('Adding song failed')
    }
  }

  async componentDidMount() {
    try {
      const trackIds = await getSongs(this.props.auth.getIdToken())
      const librarySongs = new Set(trackIds.map(trackId => ({ trackId, iframeLoaded: false })))
      this.setState({
        librarySongs
      })
    } catch (e) {
      alert(`Failed to fetch songs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Header as="h1">My Music Library</Header>
              {this.state.loadingSongs ? this.renderLoadingLibrarySongs() : null}
              {this.renderLibrarySongsList()}
            </Grid.Column>
            <Grid.Column width={6}>
              {this.renderSearchInput()}
              {this.renderSearchResults()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  renderSearchInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'green',
              labelPosition: 'left',
              icon: 'search',
              content: 'Spotify',
              onClick: this.onSubmitSearch
            }}
            fluid
            actionPosition="left"
            placeholder="Search song"
            onChange={this.handleSearchInputChange}
            onKeyDown={this.handleKeyDown}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <div>
            <Divider/>
          </div>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderSearchResults() {
    if (this.state.loadingSearchResults) {
      return this.renderLoadingSearchResults()
    }
    return this.renderSearchResultsList()
  }

  renderLoadingLibrarySongs() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Songs
        </Loader>
      </Grid.Row>
    )
  }

  renderLoadingSearchResults() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Search Results
        </Loader>
      </Grid.Row>
    )
  }

  renderLibrarySongsList() {
    if ([...this.state.librarySongs].length === 0) {
      this.setState({ loadingSongs: false })
    }
    return (
      <Grid padded>
        {[...this.state.librarySongs].map((song) => {
          const songPath = `https://open.spotify.com/embed/track/${song.trackId}`
          return (
            <Grid.Column key={song.trackId} width={8}>
              <Grid.Column width={16}>
                <iframe src={songPath} width="300" height="80" style={{ marginLeft: '9px' }}
                        onLoad={() => this.onIframeLoaded(song.trackId)}
                        frameBorder="0" allow="encrypted-media"/>
                <Button icon fluid attached='bottom' color="black" onClick={() => this.onSongDelete(song.trackId)}>
                  <Icon name="delete"/>
                  Remove from Library
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider/>
              </Grid.Column>
            </Grid.Column>
          )
        })}
      </Grid>
    )
  }

  renderSearchResultsList() {
    return (
      <Grid padded>
        {this.state.addableSearchResults.map((searchResult) => {
          return (

            <Grid.Row key={searchResult.id}>
              <Grid.Column width={4} verticalAlign="middle">
                {searchResult.imageUrl && (<Image src={searchResult.imageUrl} size="small" wrapped/>)}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <Grid.Column width={16}>
                  <h4>{searchResult.name}</h4>
                </Grid.Column>
                <Grid.Column width={16}>
                  {searchResult.artists}
                </Grid.Column>
                <Grid.Column width={16}>
                  <em>{searchResult.duration}</em>
                </Grid.Column>
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button circular color='green' icon='add' disabled={!searchResult.addable}
                        onClick={() => this.onSongAdd(searchResult.id)}/>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider/>
              </Grid.Column>
            </Grid.Row>

          )
        })}
      </Grid>
    )
  }

  private onIframeLoaded(trackId: string) {
    const librarySongs = [...this.state.librarySongs]
    const updatedLibrarySongs = librarySongs.map(song => {
      let newSong = { ...song }
      if (song.trackId === trackId) {
        newSong.iframeLoaded = true
      }
      return newSong
    })
    this.setState({ librarySongs: new Set(updatedLibrarySongs) })
    const iframesLoaded: boolean[] = updatedLibrarySongs.map(song => song.iframeLoaded)
    const reducer = (accumulator: boolean, currentValue: boolean) => accumulator && currentValue
    const allIframesLoaded: boolean = iframesLoaded.reduce(reducer, true)
    this.setState({
      loadingSongs: !allIframesLoaded
    })
  }

}
