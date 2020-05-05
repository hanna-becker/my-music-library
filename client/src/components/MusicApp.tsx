import { History } from 'history'
import * as React from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { addSong, deleteSong, getSongs, searchSong } from '../api/songs-api'
import Auth from '../auth/Auth'
import { SearchResult } from '../types/SearchResult'
import { AddableSearchResult } from '../types/AddableSearchResult'

interface MusicAppProps {
  auth: Auth
  history: History
}

interface MusicAppState {
  searchResults: SearchResult[]
  addableSearchResults: AddableSearchResult[]
  trackIds: string[]
  searchTerm: string
  loadingSongs: boolean
  loadingSearchResults: boolean
}

export class MusicApp extends React.PureComponent<MusicAppProps, MusicAppState> {
  state: MusicAppState = {
    searchResults: [],
    addableSearchResults: [],
    trackIds: [],
    searchTerm: '',
    loadingSongs: true,
    loadingSearchResults: false
  }

  private setAddableSearchResultsState() {
    const addableSearchResults = this.state.searchResults.map(result => {
      return {
        ...result,
        addable: !this.state.trackIds.includes(result.id)
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
        trackIds: this.state.trackIds.filter(id => id != trackId)
      })
      this.setAddableSearchResultsState()
    } catch {
      alert('Song deletion failed')
    }
  }

  onSongAdd = async (trackId: string) => {
    try {
      const newTrackId: string = await addSong(this.props.auth.getIdToken(), trackId)
      this.setState({
        trackIds: [...this.state.trackIds, newTrackId]
      })
      this.setAddableSearchResultsState()
    } catch {
      alert('Adding song failed')
    }
  }

  async componentDidMount() {
    try {
      const trackIds = await getSongs(this.props.auth.getIdToken())
      this.setState({
        trackIds,
        // TODO: wait for iframes to finish loading before setting this
        loadingSongs: false
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
            <Grid.Column width={8}>
              <Header as="h1">My Music</Header>
              {this.renderSongs()}
            </Grid.Column>
            <Grid.Column width={8}>
              <Header as="h1">Song Search</Header>
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
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search',
              onClick: this.onSubmitSearch
            }}
            fluid
            actionPosition="left"
            placeholder="I'm singing in the rain..."
            onChange={this.handleSearchInputChange}
            onKeyDown={this.handleKeyDown}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider/>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderSongs() {
    if (this.state.loadingSongs) {
      return this.renderLoadingSongs()
    }

    return this.renderSongsList()
  }

  renderSearchResults() {
    if (this.state.loadingSearchResults) {
      return this.renderLoadingSearchResults()
    }

    return this.renderSearchResultsList()
  }

  renderLoadingSongs() {
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

  renderSongsList() {
    return (
      <Grid padded>
        {this.state.trackIds.map((trackId) => {
          const songPath = `https://open.spotify.com/embed/track/${trackId}`
          return (
            <Grid.Row key={trackId}>
              <Grid.Column width={14} verticalAlign="middle">
                <iframe src={songPath} width="300" height="80" frameBorder="0" allow="encrypted-media"/>
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button icon color="red" onClick={() => this.onSongDelete(trackId)}>
                  <Icon name="delete"/>
                </Button>
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

  renderSearchResultsList() {
    return (
      <Grid padded>
        {this.state.addableSearchResults.map((searchResult) => {
          return (
            <Grid.Row key={searchResult.id}>
              <Grid.Column width={3} verticalAlign="middle">
                {searchResult.imageUrl && (<Image src={searchResult.imageUrl} size="small" wrapped/>)}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {searchResult.artists}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {searchResult.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" floated="right">
                {searchResult.duration}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button icon color="blue" disabled={!searchResult.addable}
                        onClick={() => this.onSongAdd(searchResult.id)}>
                  <Icon name="add"/>
                </Button>
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

}
